import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FriendService } from '../../services/friend.service';
import { MessageService } from '../../services/message.service';
import { User, FriendRequest } from '../../models/models';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit, OnDestroy {
  searchQuery = '';
  searchResults = signal<User[]>([]);
  showSearch = signal(false);
  pendingRequests = signal<FriendRequest[]>([]);
  unreadCount = signal(0);
  showNotifs = signal(false);

  private pollSub?: Subscription;
  /** Poll every 10 seconds for friend requests and unread messages */
  private readonly POLL_INTERVAL_MS = 10_000;

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private friendService: FriendService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load immediately on mount
    this.refreshNotifications();
    // Then poll continuously
    this.pollSub = interval(this.POLL_INTERVAL_MS).subscribe(() => {
      this.refreshNotifications();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  /** Fetch pending friend requests + unread message count */
  refreshNotifications(): void {
    const me = this.auth.currentUser();
    if (!me) return;

    this.friendService.getReceivedRequests(me.id).subscribe({
      next: reqs => this.pendingRequests.set(reqs),
      error: () => {}
    });

    this.messageService.getUnread(me.id).subscribe({
      next: msgs => this.unreadCount.set(msgs.length),
      error: () => {}
    });
  }

  /** Total badge count — friend requests + unread messages */
  totalBadge(): number {
    return this.pendingRequests().length + this.unreadCount();
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      this.showSearch.set(false);
      return;
    }
    this.userService.searchByName(this.searchQuery).subscribe({
      next: users => {
        this.searchResults.set(users);
        this.showSearch.set(true);
      },
      error: () => {}
    });
  }

  goToProfile(userId: number): void {
    this.showSearch.set(false);
    this.searchQuery = '';
    this.searchResults.set([]);
    this.router.navigate(['/profile', userId]);
  }

  toggleNotifs(): void {
    this.showNotifs.update(v => !v);
    // Refresh immediately when opening the panel
    if (this.showNotifs()) this.refreshNotifications();
  }

  acceptRequest(req: FriendRequest): void {
    this.friendService.accept(req.idRequest).subscribe(() => this.refreshNotifications());
  }

  refuseRequest(req: FriendRequest): void {
    this.friendService.refuse(req.idRequest).subscribe(() => this.refreshNotifications());
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  avatar(user: User): string {
    return (
      user.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom)}&background=b8f5a0&color=0d0d0d&bold=true`
    );
  }
}
