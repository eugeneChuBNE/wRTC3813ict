import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: '',
    });
  }

  submit(): void {
    this.http.post('http://localhost:3000/api/login', this.form.getRawValue(), {
      withCredentials: true
    }).subscribe(
      (res: any) => {
        console.log("User logged in", res);
        // Assuming the response contains your token or user object
        localStorage.setItem('user', JSON.stringify(res)); // Storing the whole response
        this.router.navigate(['/promote-user']);
      },
      err => {
        console.error("Login error", err);
        // Handle your error response here
      }
    );
}
}