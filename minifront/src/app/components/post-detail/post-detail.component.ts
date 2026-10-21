import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { Post, Comment, Like } from '../../models/models';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post               = signal<Post | null>(null);
  comments           = signal<Comment[]>([]);
  loading            = signal(true);
  submittingComment  = signal(false);   // FIX: was missing — prevents duplicate submits

  newComment         = '';
  editingPost        = signal(false);
  editContent        = '';
  editImage          = '';
  editingCommentId   = signal<number | null>(null);
  editCommentContent = '';

  likePending        = false;
  likesCount         = signal(0);
  liked              = signal(false);

  constructor(
    public  auth:           AuthService,
    private postService:    PostService,
    private commentService: CommentService,
    private likeService:    LikeService,
    private route:          ActivatedRoute,
    private router:         Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost(id);
  }

  // ── Post ────────────────────────────────────────────────────────────────────

  loadPost(id: number): void {
    this.loading.set(true);
    this.postService.getById(id).subscribe({
      next: post => {
        this.post.set(post);
        this.editContent = post.content;
        this.editImage   = post.image ?? '';
        this.loading.set(false);
        // Always load from DB — never rely on embedded arrays from the post payload
        this.loadComments(id);
        this.refreshLikes();
      },
      error: () => this.loading.set(false)
    });
  }

  savePostEdit(): void {
    const p = this.post();
    if (!p) return;
    this.postService.update(p.idPost, { ...p, content: this.editContent, image: this.editImage })
      .subscribe({
        next: updated => {
          this.post.set(updated);
          this.editingPost.set(false);
          // Likes survive a post edit — no need to re-fetch them
        },
        error: () => {}
      });
  }

  deletePost(): void {
    const p = this.post();
    if (!p) return;
    this.postService.delete(p.idPost).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: () => {}
    });
  }

  isPostOwner(): boolean {
    return this.post()?.author?.id === this.auth.currentUser()?.id;
  }

  // ── Likes ──────────────────────────────────────────────────────────────────

  /**
   * FIX: was named updateLikesSignals() — renamed for clarity.
   * Fetches the real like list from DB and updates both signals.
   * Uses the corrected URL: /posts/post/{id} (fixed in like.service.ts).
   */
  refreshLikes(): void {
    const p  = this.post();
    const me = this.auth.currentUser();
    if (!p || !me) return;

    this.likeService.getByPost(p.idPost)
      .pipe(catchError(() => of([] as Like[])))
      .subscribe(likes => {
        this.likesCount.set(likes.length);
        this.liked.set(likes.some(l => l.user?.id === me.id));
      });
  }

  toggleLike(): void {
    const p  = this.post();
    const me = this.auth.currentUser();
    if (!p || !me || this.likePending) return;

    this.likePending = true;
    const wasLiked   = this.liked();

    // Optimistic update
    this.liked.set(!wasLiked);
    this.likesCount.update(c => wasLiked ? c - 1 : c + 1);

    const action$ = wasLiked
      ? this.likeService.unlike(p.idPost, me.id)
      : this.likeService.like(p.idPost, me.id);

    action$.subscribe({
      next: () => {
        // Re-fetch to confirm DB state (catches duplicate-like edge cases)
        this.likeService.getByPost(p.idPost)
          .pipe(catchError(() => of(null)))
          .subscribe(likes => {
            if (likes) {
              this.likesCount.set(likes.length);
              this.liked.set(likes.some(l => l.user?.id === me.id));
            }
            this.likePending = false;
          });
      },
      error: () => {
        // Rollback on network error
        this.liked.set(wasLiked);
        this.likesCount.update(c => wasLiked ? c + 1 : c - 1);
        this.likePending = false;
      }
    });
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  loadComments(postId: number): void {
    this.commentService.getByPost(postId)
      .pipe(catchError(() => of([] as Comment[])))
      .subscribe(comments => this.comments.set(comments));
  }

  addComment(): void {
    const content = this.newComment.trim();
    const p       = this.post();
    const me      = this.auth.currentUser();
    if (!content || !p || !me || this.submittingComment()) return;

    this.submittingComment.set(true);
    this.commentService.add(me.id, p.idPost, content).subscribe({
      next: newComment => {
        // FIX: append the DB-returned comment directly — avoids a full reload round-trip
        // and gives us the real idComment assigned by the DB.
        this.comments.update(list => [...list, newComment]);
        this.newComment = '';
        this.submittingComment.set(false);
      },
      error: () => this.submittingComment.set(false)
    });
  }

  deleteComment(commentId: number): void {
    this.commentService.delete(commentId).subscribe({
      next: () => {
        // FIX: filter locally instead of re-fetching all comments
        this.comments.update(list => list.filter(c => c.idComment !== commentId));
        // If we were editing this comment, cancel the edit
        if (this.editingCommentId() === commentId) {
          this.editingCommentId.set(null);
        }
      },
      error: () => {}
    });
  }

  startEditComment(c: Comment): void {
    this.editingCommentId.set(c.idComment);
    this.editCommentContent = c.content;
  }

  saveEditComment(): void {
    const id = this.editingCommentId();
    if (!id) return;
    this.commentService.update(id, this.editCommentContent).subscribe({
      next: updated => {
        // FIX: patch only the edited comment in the list — no full reload needed
        this.comments.update(list =>
          list.map(c => c.idComment === id ? updated : c)
        );
        this.editingCommentId.set(null);
      },
      error: () => {}
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  avatar(user: any): string {
    return user?.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom ?? '?')}&background=b8f5a0&color=0d0d0d&bold=true`;
  }

  timeAgo(date: string): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const m    = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
