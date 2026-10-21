import {
  Component, OnInit, OnDestroy, signal,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { FriendService } from '../../services/friend.service';
import { User, Message } from '../../models/models';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  friends = signal<User[]>([]);
  activeUser = signal<User | null>(null);
  conversation = signal<Message[]>([]);
  newMessage = '';
  sending = signal(false);
  loadingConvo = signal(false);

  private shouldScroll = false;
  private pollSub?: Subscription;
  /** Poll every 3 seconds for new messages */
  private readonly POLL_INTERVAL_MS = 3000;

  constructor(
    public auth: AuthService,
    private messageService: MessageService,
    private friendService: FriendService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const me = this.auth.currentUser()!;
    this.friendService.getFriends(me.id).subscribe({
      next: friends => {
        this.friends.set(friends);
        const routeId = Number(this.route.snapshot.paramMap.get('userId'));
        if (routeId) {
          const target = friends.find(f => f.id === routeId);
          if (target) this.openConversation(target);
        }
      },
      error: () => {}
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  openConversation(user: User): void {
    // Stop polling for any previous conversation
    this.stopPolling();
    this.activeUser.set(user);
    this.loadConversation(user, true);
    // Start real-time polling
    this.startPolling(user);
  }

  /**
   * Load the conversation once.
   * @param scrollToEnd  whether to auto-scroll after load
   */
  loadConversation(user: User, scrollToEnd = false): void {
    const me = this.auth.currentUser()!;
    if (scrollToEnd) this.loadingConvo.set(true);

    this.messageService.getConversation(me.id, user.id).subscribe({
      next: msgs => {
        const previousCount = this.conversation().length;
        this.conversation.set(msgs);
        this.loadingConvo.set(false);

        // Only scroll if there are new messages or this is the first load
        if (scrollToEnd || msgs.length > previousCount) {
          this.shouldScroll = true;
        }

        // Mark messages sent to me as read
        msgs
          .filter(m => !m.read && m.userReceiver?.id === me.id)
          .forEach(m =>
            this.messageService.markAsRead(m.idMessage).subscribe({
              error: err => console.warn('markAsRead failed', err)
            })
          );
      },
      error: () => this.loadingConvo.set(false)
    });
  }

  /** Poll the active conversation silently every POLL_INTERVAL_MS ms */
  private startPolling(user: User): void {
    this.pollSub = interval(this.POLL_INTERVAL_MS)
      .pipe(switchMap(() => {
        const me = this.auth.currentUser()!;
        return this.messageService.getConversation(me.id, user.id);
      }))
      .subscribe({
        next: msgs => {
          const me = this.auth.currentUser()!;
          const prevCount = this.conversation().length;
          this.conversation.set(msgs);

          if (msgs.length > prevCount) {
            this.shouldScroll = true;
          }

          // Mark newly received messages as read
          msgs
            .filter(m => !m.read && m.userReceiver?.id === me.id)
            .forEach(m =>
              this.messageService.markAsRead(m.idMessage).subscribe({
                error: err => console.warn('markAsRead failed', err)
              })
            );
        },
        error: () => {} // silently ignore polling errors
      });
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content || !this.activeUser()) return;
    const me = this.auth.currentUser()!;
    this.sending.set(true);

    this.messageService.send(me.id, this.activeUser()!.id, content).subscribe({
      next: msg => {
        // Optimistic append — avoid full reload
        this.conversation.update(msgs => [...msgs, msg]);
        this.newMessage = '';
        this.sending.set(false);
        this.shouldScroll = true;
      },
      error: () => this.sending.set(false)
    });
  }

  scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  isOwn(msg: Message): boolean {
    return msg.userSender?.id === this.auth.currentUser()?.id;
  }

  avatar(user: User | null): string {
    if (!user) return '';
    return (
      user.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom)}&background=b8f5a0&color=0d0d0d&bold=true`
    );
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
