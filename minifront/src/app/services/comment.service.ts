import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  getByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.API}/comments/post/${postId}`);
  }

  add(userId: number, postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.API}/comments?userId=${userId}&postId=${postId}`,
      content,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  update(id: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(
      `${this.API}/comments/${id}?content=${encodeURIComponent(content)}`,
      {}
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/comments/${id}`);
  }
}
