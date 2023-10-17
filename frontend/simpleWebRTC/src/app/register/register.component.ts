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
          // Navigate to login page or any other page after successful registration
          this.router.navigateByUrl('/login'); // or '/home' if you want to redirect the user to home page after registration
        } else {
          this.errorMessage = "Error registering"; // Customize your error message here
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
