import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Like } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  // FIX: was `/posts/${postId}` — missing the `/post/` segment, so it never hit the right endpoint
  getByPost(postId: number): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.API}/posts/post/${postId}`);
  }

  like(postId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.API}/posts/${postId}/like?userId=${userId}`, {});
  }

  unlike(postId: number, userId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API}/posts/${postId}/like?userId=${userId}`);
  }
}
