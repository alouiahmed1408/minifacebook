import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/users`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/users/${id}`);
  }

  searchByName(nom: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/userbyname?nom=${encodeURIComponent(nom)}`);
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/users/${id}`, user);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API}/users/${id}`);
  }
}
