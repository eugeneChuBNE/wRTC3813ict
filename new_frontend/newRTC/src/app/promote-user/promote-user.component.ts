import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-promote-user',
  templateUrl: './promote-user.component.html',
  styleUrls: ['./promote-user.component.css']
})
export class PromoteUserComponent implements OnInit {
  form!: FormGroup;
  users: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService // make sure the AuthService is injected
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userId: '',
      role: ''
    });

    // Log the current user's username and role
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      console.log(`Authenticated user - Username: ${currentUser.username}, Role: ${currentUser.role}`);
    } else {
      console.log('No user is currently authenticated.');
    }

    this.fetchUsers();
  }

  fetchUsers(): void {
    this.http.get('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.users = res;
          // Log each user's name and role from the fetched list
          this.users.forEach(user => {
            console.log(`Fetched User: ${user.username}, Role: ${user.role}`);
          });
        },
        err => {
          console.error('There was an error fetching the users', err);
        }
      );
  }

  submit(): void {
    this.http.patch(`http://localhost:3000/api/users/${this.form.value.userId}/role`, 
      {
        role: this.form.value.role
      }, 
      {
        withCredentials: true
      }
    ).subscribe(
      res => {
        console.log('User role updated', res);
        // Refetch the user list to update the UI with the latest data
        this.fetchUsers();
      },
      err => {
        console.error('There was an error updating the user role', err);
      }
    );
  }
}
