import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  userName!: string;
  userRole!: string;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // this will refresh the login status on page load
    this.authService.checkLoginStatus();
    
    this.isLoggedIn$ = this.authService.isLoggedIn;

    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      this.userName = userData.name;
      this.userRole = userData.role;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
