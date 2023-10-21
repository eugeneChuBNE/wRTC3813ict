import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  isAdmin: boolean = false; // You'll need to determine this based on your app's logic

  constructor(
    private http: HttpClient,     
    private authService: AuthService 
  ) { }

  ngOnInit(): void {       
    this.fetchUsers();
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      console.log(`Authenticated user - Username: ${currentUser.username}, Role: ${currentUser.role}`);
    } else {
      console.log('No user is currently authenticated.');
    }
    this.isAdmin = currentUser.role.includes('admin');

  }

  fetchUsers(): void {
    this.http.get('http://localhost:3000/api/users', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.users = res;
          console.log('Users fetched successfully:', this.users);
        },
        err => {
          console.error('There was an error fetching the users:', err);
        }
      );
  }
  deleteUser(userId: string): void {
    if(confirm("Are you sure to delete this user?")) {
      this.http.delete(`http://localhost:3000/api/users/${userId}`, { withCredentials: true })
        .subscribe(
          res => {
            console.log('User deleted successfully:', res);
            this.fetchUsers(); // refresh the list of users
          },
          err => {
            console.error('There was an error deleting the user:', err);
          }
        );
    }
  }
}
