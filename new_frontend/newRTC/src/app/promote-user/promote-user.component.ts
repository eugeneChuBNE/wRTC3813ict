import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  groups: any[] = [];
  selectedGroups: string[] = [];
  showGroups: boolean = false;
  selectedUser: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      userId: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.form.get('userId')!.valueChanges.subscribe(userId => {
      this.onUserChange(userId);
    });

    this.form.get('role')!.valueChanges.subscribe(role => {
      this.onRoleChange(role);
    });

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      console.log(`Authenticated user - Username: ${currentUser.username}, Role: ${currentUser.role}`);
    } else {
      console.log('No user is currently authenticated.');
    }

    this.fetchUsers();
    this.fetchGroups();
  }

  fetchUsers(): void {
    this.http.get('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.users = res;
          this.users.forEach(user => {
            console.log(`Fetched User: ${user.username}, Role: ${user.role}`);
          });
        },
        err => {
          console.error('There was an error fetching the users', err);
        }
      );
  }

  fetchGroups(): void {
    this.http.get('http://localhost:3000/api/groups', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.groups = res;
        },
        err => {
          console.error('There was an error fetching the groups', err);
        }
      );
  }

  onUserChange(userId: string): void {
    this.selectedUser = this.users.find(user => user._id === userId);
    if (this.selectedUser) {
      this.groups = this.groups.map(group => ({
        ...group,
        disabled: this.isUserModOfGroup(group._id),
      }));
    }
  }

  onRoleChange(role: string): void {
    this.showGroups = role === 'mod';
    if (!this.showGroups) {
      this.selectedGroups = [];
    }
  }

  onGroupSelect(event: any, groupId: string): void {
    if (event.target.checked) {
      this.selectedGroups.push(groupId);
    } else {
      this.selectedGroups = this.selectedGroups.filter(id => id !== groupId);
    }
  }

  isUserModOfGroup(groupId: string): boolean {
    return this.selectedUser?.groups?.includes(groupId) ?? false; // Safe navigation and defaulting to false if undefined
  }

  submit(): void {
    this.http.patch(`http://localhost:3000/api/users/${this.form.value.userId}/role`, 
      {
        role: this.form.value.role,
        groupIds: this.selectedGroups
      }, 
      {
        withCredentials: true
      }
    ).subscribe(
      res => {
        console.log('User role updated', res);
        this.fetchUsers(); // Refresh the list of users
      },
      err => {
        console.error('There was an error updating the user role', err);
      }
    );
  }
}
