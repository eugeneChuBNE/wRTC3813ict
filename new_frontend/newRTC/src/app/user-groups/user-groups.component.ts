import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-groups',
  templateUrl: './user-groups.component.html',
  styleUrls: ['./user-groups.component.css']
})
export class UserGroupsComponent implements OnInit {
  groups: any[] = [];
  currentUser: any;

  constructor(private http: HttpClient, private router: Router) { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')!); // Assuming you store user data here
  }

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/api/my-groups', { withCredentials: true })
      .subscribe(
        data => {
          this.groups = data;
        },
        error => {
          console.error('There was an error while retrieving the groups!', error);
        }
      );
  }

  viewGroup(groupId: string): void {
    this.router.navigate([`/group/${groupId}/channels`]);
  }

  deleteGroup(groupId: string): void {
    this.http.delete(`http://localhost:3000/api/groups/${groupId}`, { withCredentials: true })
      .subscribe(
        response => {
          console.log(response);
          // Remove the group from the local array to update the UI
          this.groups = this.groups.filter(group => group._id !== groupId);
        },
        error => {
          console.error('There was an error deleting the group!', error);
        }
      );
  }

  canDelete(group: any): boolean {
    return this.currentUser.role.includes('admin') || group.mods.includes(this.currentUser._id);
  }
}
