import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Emitters } from '../emitters/emitters';

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
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.users = res;
          Emitters.authEmitter.emit(true);
        },
        err => {
          console.error('There was an error fetching the users', err);
          Emitters.authEmitter.emit(false);

        }
      );
    this.form = this.formBuilder.group({
      userId: '',
      role: ''
    });

    
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
        // Emitting an event indicating that a user's role has been updated.
        Emitters.authEmitter.emit(true);
        // You can also pass any relevant data you'd like to share with other components as part of the emitted event.
      },
      err => {
        console.error('There was an error updating the user role', err);
        Emitters.authEmitter.emit(false); // Emitting false on error could be used to trigger error handling or UI changes.
      }
    );
  }
}
