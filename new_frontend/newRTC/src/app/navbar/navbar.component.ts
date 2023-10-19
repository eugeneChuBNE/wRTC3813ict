import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // Adjust the path if your service is in a different location

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  authenticated = false;
  user_name = '';
  user_role = '';

  constructor(
    private authService: AuthService, // injected AuthService
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to the currentUser observable from AuthService
    this.authService.currentUser.subscribe(user => {
      this.authenticated = !!user; // Convert user to a boolean to indicate authentication status

      if (user) {
        this.user_name = user.username;
        this.user_role = user.role;
      } else {
        this.user_name = '';
        this.user_role = '';
      }
    });
  }

  logout(): void {
    // Simply call the logout method from AuthService
    this.authService.logout();
    localStorage.removeItem('currentUser');
    console.log("User logged out successfully.");
    this.authenticated = false; // Update the state locally, or better, rely on the subscription to currentUser from AuthService
  }
}
