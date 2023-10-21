import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private apiUrl = 'http://localhost:3000/api/join-requests'; 
  constructor(private http: HttpClient) { }

  getJoinRequests(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { withCredentials: true });
  }

  approveRequest(requestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${requestId}`, { action: 'approve' }, { withCredentials: true });
  }

  declineRequest(requestId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${requestId}`, { action: 'decline' }, { withCredentials: true });
  }
}
