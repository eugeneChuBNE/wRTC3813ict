import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  groups: any[] = [];
  isLoggedIn = false;
  isAdminOrMod = false;
  newGroupName: string = '';
  currentUserId: string | null = null;
  userRole: string | null = null;
  message: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.checkAuthenticationStatus();
    const currentUser = this.authService.currentUserValue;
    this.isLoggedIn = currentUser !== null;

    if (this.isLoggedIn && currentUser) {
      this.currentUserId = currentUser._id;
      const role = this.authService.getUserRole();
      this.userRole = role;
      if (role) {
        this.isAdminOrMod = role.includes('admin') || role.includes('mod');
      }
      this.fetchGroups();
    }
  }

  fetchGroups(): void {
    this.http.get('http://localhost:3000/api/groups', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.groups = res.map((group: any) => {
            const shouldShowJoin = this.calculateShouldShowJoinButton(group);
            return {
              ...group,
              shouldShowJoin,
              isUserAMod: group.mods.includes(this.currentUserId),
            };
          });
        },
        err => {
          this.message = 'There was an error fetching the groups: ' + err.message;
        }
      );
  }

  calculateShouldShowJoinButton(group: any): boolean {
    if (!this.isLoggedIn || !this.currentUserId || !this.userRole) {
      return false; // Not logged in, no user ID, or no user role, so don't show
    }
  
    const isMember = group.members.includes(this.currentUserId);
    const isAdmin = this.userRole.includes('admin');
  
    if (isAdmin || isMember) {
      return false;
    }
  
    return true; // User is not a member and not a mod/admin, so they should see the "Join" button
  }
  

  navigateToGroupChannels(groupId: string): void {
    this.router.navigate([`/group/${groupId}/channels`]);
  }

  deleteGroup(groupId: string): void {
    this.http.delete(`http://localhost:3000/api/groups/${groupId}`, { withCredentials: true })
      .subscribe(
        () => {
          this.groups = this.groups.filter(group => group._id !== groupId);
        },
        err => {
          this.message = 'There was an error deleting the group: ' + err.message;
        }
      );
  }

  createGroupInline(): void {
    if (this.newGroupName.trim()) {
      this.http.post('http://localhost:3000/api/groups', { name: this.newGroupName }, { withCredentials: true })
        .subscribe(
          (response: any) => {
            this.groups.push(response);
            this.newGroupName = '';
            this.message = 'Group created successfully.';
          },
          error => {
            this.message = 'There was an error creating the group: ' + error.message;
          }
        );
    } else {
      this.message = 'Group name cannot be empty.';
    }
  }

  requestToJoinGroup(groupId: string): void {
    this.http.post(`http://localhost:3000/api/groups/${groupId}/requests`, {}, { withCredentials: true })
      .subscribe(
        (response: any) => {
          this.message = 'Request to join group submitted successfully.';
        },
        error => {
          this.message = 'Error submitting request to join the group: ' + error.message;
        }
      );
  }
}
