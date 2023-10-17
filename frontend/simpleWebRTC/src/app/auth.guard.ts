import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Import the map operator
import { AuthService } from './services/auth.service'; // Adjust the import to match your folder structure

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {} // Inject AuthService and Router

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isLoggedIn // No () here because it's a getter, not a method
      .pipe(
        map(isLoggedIn => { // Use the map operator to transform the emitted value
          if (!isLoggedIn) {
            this.router.navigate(['/']); // Redirect to home/login page if not logged in
            return false; // User is not logged in, so the guard returns false
          }
          return true; // User is logged in, so the guard returns true
        })
      );
  }
}
