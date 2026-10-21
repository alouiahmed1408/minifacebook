import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NavComponent } from '../nav/nav.component';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { Post, Like, Comment } from '../../models/models';

interface PostVM extends Post {
  likes: Like[];
  comments: Comment[];
  likePending: boolean;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts = signal<PostVM[]>([]);
  loading = signal(true);
  submitting = signal(false);
  newContent = signal('');
  image = signal('');
  expanded = new Set<number>();
  commentInputs: Record<number, string> = {};

  constructor(
    public auth: AuthService,
    private postService: PostService,
    private commentService: CommentService,
    private likeService: LikeService
  ) {}

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.loading.set(true);
    this.postService.getAll().subscribe({
      next: posts => {
        const vms: PostVM[] = posts.reverse().map(p => ({
          ...p,
          likes: p.likes ?? [],
          comments: p.comments ?? [],
          likePending: false
        }));
        this.posts.set(vms);
        this.loading.set(false);
        this.refreshAllPostData(vms);
      },
      error: () => this.loading.set(false)
    });
  }

  private refreshAllPostData(vms: PostVM[]): void {
    vms.forEach(vm => this.refreshPostData(vm.idPost));
  }

  private refreshPostData(postId: number): void {
    forkJoin({
      likes: this.likeService.getByPost(postId).pipe(catchError(() => of([] as Like[]))),
      comments: this.commentService.getByPost(postId).pipe(catchError(() => of([] as Comment[])))
    }).subscribe(({ likes, comments }) => {
      this.patchPost(postId, { likes, comments });
    });
  }

  private patchPost(postId: number, patch: Partial<PostVM>): void {
    this.posts.update(list =>
      list.map(p => p.idPost === postId ? { ...p, ...patch } : p)
    );
  }

  createPost(): void {
    const content = this.newContent().trim();
    const image = this.image().trim();
    if ((!content && !image) || this.submitting()) return;
    const me = this.auth.currentUser()!;
    this.submitting.set(true);
    this.postService.create({
      content,
      image,
      dateCreation: new Date().toISOString().slice(0, 10),
      author: me
    } as Partial<Post>).subscribe({
      next: () => {
        this.newContent.set('');
        this.image.set('');
        this.submitting.set(false);
        this.loadFeed();
      },
      error: () => this.submitting.set(false)
    });
  }

  deletePost(postId: number): void {
    this.postService.delete(postId).subscribe({
      next: () => this.posts.update(list => list.filter(p => p.idPost !== postId))
    });
  }

  isLiked(post: PostVM): boolean {
    const me = this.auth.currentUser();
    return !!me && post.likes.some(l => l.user?.id === me.id);
  }

  likeCount(post: PostVM): number {
    return post.likes.length;
  }

  toggleLike(post: PostVM): void {
    const me = this.auth.currentUser();
    if (!me || post.likePending) return;
    const alreadyLiked = this.isLiked(post);
    this.patchPost(post.idPost, {
      likePending: true,
      likes: alreadyLiked
        ? post.likes.filter(l => l.user?.id !== me.id)
        : [...post.likes, { user: me, post: { idPost: post.idPost } } as Like]
    });
    const action$ = alreadyLiked
      ? this.likeService.unlike(post.idPost, me.id)
      : this.likeService.like(post.idPost, me.id);
    action$.subscribe({
      next: () => {
        this.likeService.getByPost(post.idPost).pipe(catchError(() => of(post.likes))).subscribe(likes => {
          this.patchPost(post.idPost, { likes, likePending: false });
        });
      },
      error: () => {
        this.patchPost(post.idPost, { likes: post.likes, likePending: false });
      }
    });
  }

  toggleComments(postId: number): void {
    if (this.expanded.has(postId)) {
      this.expanded.delete(postId);
    } else {
      this.expanded.add(postId);
      this.commentService.getByPost(postId).pipe(catchError(() => of([] as Comment[]))).subscribe(comments => {
        this.patchPost(postId, { comments });
      });
    }
  }

  isExpanded(postId: number): boolean {
    return this.expanded.has(postId);
  }

  submitComment(post: PostVM): void {
    const content = (this.commentInputs[post.idPost] ?? '').trim();
    if (!content) return;
    const me = this.auth.currentUser()!;
    this.commentInputs[post.idPost] = '';
    this.commentService.add(me.id, post.idPost, content).subscribe({
      next: newComment => {
        this.patchPost(post.idPost, { comments: [...post.comments, newComment] });
      },
      error: () => {
        this.commentInputs[post.idPost] = content;
      }
    });
  }

  deleteComment(post: PostVM, commentId: number): void {
    this.commentService.delete(commentId).subscribe({
      next: () => {
        this.patchPost(post.idPost, {
          comments: post.comments.filter(c => c.idComment !== commentId)
        });
      }
    });
  }

  avatar(user: any): string {
    return user?.photoProfile ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nom ?? '?')}&background=b8f5a0&color=0d0d0d&bold=true`;
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