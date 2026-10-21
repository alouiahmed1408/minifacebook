import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { FriendService } from '../../services/friend.service';
import { UserService } from '../../services/user.service';
import { User, FriendRequest } from '../../models/models';
import { forkJoin } from 'rxjs';

type Tab = 'friends' | 'requests' | 'discover';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent implements OnInit {
  tab = signal<Tab>('friends');
  friends  = signal<User[]>([]);
  received = signal<FriendRequest[]>([]);
  sent     = signal<FriendRequest[]>([]);
  discover = signal<User[]>([]);
  searchQuery = '';
  loading = signal(true);
  pendingActions = signal<Set<number>>(new Set());

  constructor(
    public auth: AuthService,
    private friendService: FriendService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  /**
   * Uses forkJoin so friends + sent + received all arrive before we
   * compute the discover list — eliminates the race condition.
   *
   * Because FriendService now has catchError on every method, forkJoin
   * will never error-out: each stream falls back to [] on failure,
   * so the page always renders instead of spinning forever.
   */
  loadAll(): void {
    const me = this.auth.currentUser()!;
    this.loading.set(true);

    forkJoin({
      friends:  this.friendService.getFriends(me.id),
      received: this.friendService.getReceivedRequests(me.id),
      sent:     this.friendService.getSentRequests(me.id)
    }).subscribe({
      next: ({ friends, received, sent }) => {
        this.friends.set(friends);
        this.received.set(received);
        this.sent.set(sent);
        this.loading.set(false);
        this.loadDiscover();
      },
      error: () => this.loading.set(false)
    });
  }

  loadDiscover(): void {
    const me = this.auth.currentUser()!;
    this.userService.getAll().subscribe({
      next: users => {
        const friendIds = new Set(this.friends().map(f => f.id));
        const sentIds   = new Set(this.sent().map(r => r.userReceiver?.id));
        this.discover.set(
          users.filter(u =>
            u.id !== me.id &&
            !friendIds.has(u.id) &&
            !sentIds.has(u.id)
          )
        );
      },
      error: () => {}
    });
  }

  searchPeople(): void {
    if (!this.searchQuery.trim()) {
      this.loadDiscover();
      return;
    }
    this.userService.searchByName(this.searchQuery).subscribe({
      next: users => {
        const me = this.auth.currentUser()!;
        this.discover.set(users.filter(u => u.id !== me.id));
      },
      error: () => {}
    });
  }

  accept(req: FriendRequest): void {
    this.setActionPending(req.idRequest, true);
    this.friendService.accept(req.idRequest).subscribe({
      next: () => { this.setActionPending(req.idRequest, false); this.loadAll(); },
      error: () => { this.setActionPending(req.idRequest, false); }
    });
  }

  refuse(req: FriendRequest): void {
    this.setActionPending(req.idRequest, true);
    this.friendService.refuse(req.idRequest).subscribe({
      next: () => { this.setActionPending(req.idRequest, false); this.loadAll(); },
      error: () => { this.setActionPending(req.idRequest, false); }
    });
  }

  sendRequest(user: User): void {
    const me = this.auth.currentUser()!;
    this.setActionPending(user.id, true);
    this.friendService.sendRequest(me.id, user.id).subscribe({
      next: () => { this.setActionPending(user.id, false); this.loadAll(); },
      error: () => { this.setActionPending(user.id, false); }
    });
  }

  removeFriend(user: User): void {
    const me = this.auth.currentUser()!;
    this.setActionPending(user.id, true);
    this.friendService.removeFriend(me.id, user.id).subscribe({
      next: () => { this.setActionPending(user.id, false); this.loadAll(); },
      error: () => { this.setActionPending(user.id, false); }
    });
  }

  isSentTo(userId: number): boolean {
    return this.sent().some(r => r.userReceiver?.id === userId);
  }

  isActionPending(id: number): boolean {
    return this.pendingActions().has(id);
  }

  private setActionPending(id: number, pending: boolean): void {
    const set = new Set(this.pendingActions());
    pending ? set.add(id) : set.delete(id);
    this.pendingActions.set(set);
  }

  avatar(user: User): string {
    return (
      user.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom)}&background=b8f5a0&color=0d0d0d&bold=true`
    );
  }
}
