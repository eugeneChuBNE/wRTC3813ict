import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Make sure to import your AuthService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService

  login(): void {
    console.log(this.email, this.password);

    const bodyData = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(bodyData).subscribe(
      res => {
        console.log(res);
        if (res.status) {
          this.authService.setLoginStatus(true); // Update the login status upon successful login
          this.router.navigateByUrl('/dashboard');
        } else {
          this.errorMessage = "Incorrect email/password"; // In case of failed login attempt
          console.log("Error logging in");
        }
      },
      error => {
        console.error(error);
        this.errorMessage = "An error occurred during login.";
      }
    );
  }
}