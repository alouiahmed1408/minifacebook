import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FriendRequest, User } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class FriendService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  /**
   * Returns a Set<User> from the backend serialised as a JSON array.
   * FIX: catchError returns [] so callers never have to handle null/undefined.
   */
  getFriends(userId: number): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.API}/friends/${userId}`)
      .pipe(catchError(() => of([])));
  }

  getSentRequests(userId: number): Observable<FriendRequest[]> {
    return this.http
      .get<FriendRequest[]>(`${this.API}/friends/sent/${userId}`)
      .pipe(catchError(() => of([])));
  }

  getReceivedRequests(userId: number): Observable<FriendRequest[]> {
    return this.http
      .get<FriendRequest[]>(`${this.API}/friends/requests/${userId}`)
      .pipe(catchError(() => of([])));
  }

  /**
   * FIX: typed as Observable<FriendRequest | null> to match the backend
   * which returns the saved FriendRequest on success, or an empty 200
   * body when the request already existed.
   */
  sendRequest(senderId: number, receiverId: number): Observable<FriendRequest | null> {
    return this.http
      .post<FriendRequest | null>(`${this.API}/friends/${senderId}/${receiverId}`, {})
      .pipe(catchError(() => of(null)));
  }

  accept(requestId: number): Observable<void> {
    return this.http
      .put<void>(`${this.API}/friends/accept/${requestId}`, {})
      .pipe(catchError(() => of(undefined as any)));
  }

  refuse(requestId: number): Observable<void> {
    return this.http
      .put<void>(`${this.API}/friends/refuse/${requestId}`, {})
      .pipe(catchError(() => of(undefined as any)));
  }

  removeFriend(userId: number, friendId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API}/friends/${userId}/${friendId}`)
      .pipe(catchError(() => of(undefined as any)));
  }
}
