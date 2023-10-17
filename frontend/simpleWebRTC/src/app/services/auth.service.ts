import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken()); // Initialize with the token check

  constructor(private httpClient: HttpClient) {}

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable(); // Exposes the loggedIn as an observable
  }

  private hasToken(): boolean {
    // Check if userData exists in localStorage
    const userData = localStorage.getItem('userData');
    return !!userData;
  }

  login(user: { email: string; password: string }): Observable<any> {
    return this.httpClient.post<any>('http://localhost:3000/user/login', user)
      .pipe(
        tap(response => {
          if (response && response.token) {
            // Here you should ideally store the token, user's name, and role returned from the API
            // Assuming the response has a structure like { token: '...', user: { name: '...', role: '...' } }
            localStorage.setItem('userData', JSON.stringify(response.user));
            this.loggedIn.next(true);
          }
        })
      );
  }

  logout(): void {
    // Remove the user data from localStorage
    localStorage.removeItem('userData');
    // And update the loggedIn BehaviorSubject
    this.loggedIn.next(false);
  }

  checkLoginStatus(): void {
    this.loggedIn.next(this.hasToken());
  }

  setLoginStatus(isLoggedIn: boolean): void {
    this.loggedIn.next(isLoggedIn); // Updates the login status
  }

  register(user: { name: string; email: string; password: string }): Observable<any> {
    return this.httpClient.post<any>('http://localhost:3000/user/register', user);
  }
}
 