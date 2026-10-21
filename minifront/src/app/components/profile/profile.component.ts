import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { FriendService } from '../../services/friend.service';
import { User, Post } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileUser = signal<User | null>(null);
  posts = signal<Post[]>([]);
  friends = signal<User[]>([]);
  loading = signal(true);
  isOwn = signal(false);
  isFriend = signal(false);
  requestSent = signal(false);
  hasPendingRequest = signal(false);
  editing = signal(false);

  editNom = '';
  editBio = '';
  editPhoto = '';

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private postService: PostService,
    private friendService: FriendService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      // FIX: reset transient state on every route change so stale signals
      // don't bleed from one profile to another
      this.requestSent.set(false);
      this.hasPendingRequest.set(false);
      this.isFriend.set(false);
      this.editing.set(false);
      this.loadProfile(id);
    });
  }

  loadProfile(id: number): void {
    this.loading.set(true);
    const me = this.auth.currentUser()!;
    this.isOwn.set(me.id === id);

    // Use forkJoin so all data arrives together — avoids partial renders
    forkJoin({
      user: this.userService.getById(id),
      friends: this.friendService.getFriends(id),
      allPosts: this.postService.getAll(),
      sentRequests: this.isOwn() ? Promise.resolve([]) : this.friendService.getSentRequests(me.id)
    }).subscribe({
      next: ({ user, friends, allPosts, sentRequests }) => {
        this.profileUser.set(user);
        this.friends.set(Array.isArray(friends) ? friends : []);
        this.posts.set(allPosts.filter(p => p.author?.id === id).reverse());
        this.loading.set(false);

        this.editNom = user.nom;
        this.editBio = user.bio ?? '';
        this.editPhoto = user.photoProfile ?? '';

        if (!this.isOwn()) {
          this.isFriend.set(friends.some(f => f.id === me.id));
          // Check if we already sent a request
          const requests = Array.isArray(sentRequests) ? sentRequests : [];
          this.hasPendingRequest.set(
            requests.some(r => (r.userReceiver?.id ) === id)
          );
        }
      },
      error: () => this.loading.set(false)
    });
  }

  sendRequest(): void {
    const me = this.auth.currentUser()!;
    const target = this.profileUser()!;
    this.friendService.sendRequest(me.id, target.id).subscribe({
      next: () => {
        this.requestSent.set(true);
        this.hasPendingRequest.set(true);
      },
      error: () => {}
    });
  }

  removeFriend(): void {
    const me = this.auth.currentUser()!;
    const target = this.profileUser()!;
    this.friendService.removeFriend(me.id, target.id).subscribe({
      next: () => {
        this.isFriend.set(false);
        this.loadProfile(target.id);
      },
      error: () => {}
    });
  }

  messageUser(): void {
    const target = this.profileUser()!;
    this.router.navigate(['/messages', target.id]);
  }

  saveEdit(): void {
    const me = this.auth.currentUser()!;
    const updated: Partial<User> = {
      ...me,
      nom: this.editNom,
      bio: this.editBio,
      photoProfile: this.editPhoto
    };
    this.userService.update(me.id, updated).subscribe({
      next: user => {
        this.auth.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.profileUser.set(user);
        this.editing.set(false);
      },
      error: () => {}
    });
  }

  avatar(user: User | null): string {
    if (!user) return '';
    return (
      user.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom)}&background=b8f5a0&color=0d0d0d&bold=true`
    );
  }

  timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
