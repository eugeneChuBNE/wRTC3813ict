import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust the path if your service is in a different location

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService, // injected AuthService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: '',
    });
  }

  submit(): void {
    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;

    this.authService.login(email, password)
      .subscribe(
        data => {
          console.log("User is logged in");
          this.router.navigate(['/']);
        },
        error => {
          console.error("Error logging in", error);
        });
  }
}
