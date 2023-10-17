import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false); // Holds the login state

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable(); // Exposes the loggedIn as an observable
  }

  constructor(private httpClient: HttpClient) {}

  login(user: { email: string; password: string }): Observable<any> {
    return this.httpClient.post<any>('http://localhost:3000/user/login', user);
  }

  setLoginStatus(isLoggedIn: boolean): void {
    this.loggedIn.next(isLoggedIn); // Updates the login status
  }

  register(user: { name: string; email: string; password: string }): Observable<any> {
    return this.httpClient.post<any>('http://localhost:3000/user/register', user);
  }
}
