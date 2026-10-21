import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API}/posts`);
  }

  getById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.API}/posts/${id}`);
  }

  create(post: Partial<Post>): Observable<boolean> {
    return this.http.post<boolean>(`${this.API}/posts`, post);
  }

  update(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.API}/posts/${id}`, post);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API}/posts/${id}`);
  }
}
