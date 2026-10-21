import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/models';
import { API_URL } from '../api.config';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly API = API_URL;

  constructor(private http: HttpClient) {}

  getConversation(user1: number, user2: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API}/messages?user1=${user1}&user2=${user2}`);
  }

  // FIX: was GET /messages/{id} — now GET /messages/unread/{id} to avoid clash with conversation route
  getUnread(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.API}/messages/unread/${userId}`);
  }

  send(senderId: number, receiverId: number, content: string): Observable<Message> {
    return this.http.post<Message>(
      `${this.API}/messages?senderId=${senderId}&receiverId=${receiverId}`,
      content,
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }

  // FIX: was PUT /messages/{id}?messageId={id} — now PUT /messages/{id}/read (clean, no duplicate param)
  markAsRead(messageId: number): Observable<void> {
    return this.http.put<void>(`${this.API}/messages/${messageId}/read`, {});
  }

  // FIX: was DELETE /messages?messageId={id} — now DELETE /messages/{id}
  delete(messageId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.API}/messages/${messageId}`);
  }
}
