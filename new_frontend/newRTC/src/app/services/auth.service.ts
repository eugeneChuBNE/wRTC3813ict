import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap,tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/login`, { email, password }, { withCredentials: true })
      .pipe(
        switchMap(() => {
          // After a successful login, make another request to fetch the user's info
          return this.http.get('http://localhost:3000/api/user', {withCredentials: true});
        }),
        tap(user => {  
          // store user details in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }
  
  logout(): Observable<any> {
    console.log('logout');
    localStorage.removeItem('currentUser');

    return this.http.post('http://localhost:3000/api/logout', {}, {withCredentials: true})
      .pipe(tap(() => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }));
    
  }

  public checkAuthenticationStatus(): void {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser !== null) {
      this.currentUserSubject.next(JSON.parse(currentUser));
    }
  }
  public getUserRole(): string | null {
    const currentUser = this.currentUserValue; // this gets the current user
    console.log("Current user: ", currentUser)
    return currentUser?.role || null; // this returns the user's role or null if there's no logged-in user
  }
  
}
