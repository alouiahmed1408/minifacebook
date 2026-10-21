import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = API_URL;
  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  private loadUser(): User | null {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  }

  register(payload: Omit<User, 'id'>): Observable<boolean> {
    return this.http.post<boolean>(`${this.API}/users`, payload);
  }

  login(email: string, password: string): Observable<User> {
    // POST body: the password never appears in the URL / server logs
    return this.http.post<User>(`${this.API}/login`, { email, password }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
