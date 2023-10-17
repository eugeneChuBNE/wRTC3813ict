import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ensure this path is correct based on your folder structure

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService here

  register(): void {
    const newUser = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(newUser).subscribe(
      res => {
        console.log(res);
        if (res.status) {
          // User successfully registered, now log them in
          this.authService.login(newUser).subscribe(
            loginRes => {
              console.log(loginRes);
              if (loginRes.status) {
                this.authService.setLoginStatus(true);
                this.router.navigateByUrl('/dashboard');
              } else {
                this.errorMessage = "Error logging in after registration"; 
                console.log("Error during login after registration");
              }
            },
            loginError => {
              console.error(loginError);
              this.errorMessage = "An error occurred during login after registration.";
            }
          );
        } else {
          this.errorMessage = "Error registering"; 
          console.log("Error during registration");
        }
      },
      error => {
        console.error(error);
        this.errorMessage = "An error occurred during registration.";
      }
    );
  }
}
