import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-group-channels',
  templateUrl: './group-channels.component.html',
  styleUrls: ['./group-channels.component.css']
})
export class GroupChannelsComponent implements OnInit {
  groupId: string = '';
  group: any = null;
  isAdmin = false;
  isMod = false;
  currentUserId: string | null = null;
  newChannelName: string = ''; // For binding the input for new channel name
  members: any[] = []; // Member list

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';

    const currentUser = this.authService.currentUserValue;
    this.currentUserId = currentUser?._id;
    const role = this.authService.getUserRole();
    if (role) {
      this.isAdmin = role.includes('admin');
    }

    this.fetchGroup();
    this.fetchMembers(); // Fetch group members
  }

  fetchGroup(): void {
    this.http.get(`http://localhost:3000/api/groups/${this.groupId}`, { withCredentials: true })
      .subscribe(
        (res: any) => {
          console.log('gr', res);
          this.group = res;
          this.isMod = this.group.mods.includes(this.currentUserId);
        },
        err => {
          console.error('There was an error fetching the group', err);
        }
      );
  }

  fetchMembers(): void {
    this.http.get(`http://localhost:3000/api/groups/${this.groupId}/members`, { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.members = res.members;
        },
        err => {
          console.error('There was an error fetching group members', err);
        }
      );
  }

  createChannelInline(): void {
    if (this.newChannelName.trim()) {
      this.http.post(`http://localhost:3000/api/groups/${this.groupId}/channels`, { name: this.newChannelName }, { withCredentials: true })
        .subscribe(
          (response: any) => {
            console.log('Channel created successfully');
            this.group.channels.push(response); // Update the UI with the new channel
            this.newChannelName = ''; // Clear the input field
          },
          error => {
            console.error('There was an error creating the channel', error);
          }
        );
    } else {
      console.error('Channel name cannot be empty');
    }
  }
  navigateToCreateChannel(): void {
    this.router.navigate([`/group/${this.groupId}/create-channel`]);
  }
  navigateToChannel(channelId: string): void {
    this.router.navigate([`/group/${this.groupId}/channel/${channelId}`]);
  }

  canGoToChannel(memberId: string): boolean {
    // Check if the member is in the channel's member list
    const isMemberInChannel = this.group.channels.some((channel: any) => channel.members.includes(memberId));
    
    // Check if the current user is an admin or mod of the group
    const isUserAdminOrMod = this.isAdmin || this.isMod;
    
    // Return true if any of the conditions are met
    return isMemberInChannel || isUserAdminOrMod;
  }


  getMemberRole(member: any): string {
    if (this.isAdmin || this.isMod) {
        // If the current user is an admin or mod of the group,
        // display the member's actual role
        return member.role;
    } else {
        // If the current user is a regular user, check if the member is a mod in this group
        if (this.group.mods.includes(member._id)) {
            return 'mod';
        } else {
            return 'user';
        }
    }
  }

  deleteChannel(channelId: string): void {
    this.http.delete(`http://localhost:3000/api/groups/${this.groupId}/channels/${channelId}`, { withCredentials: true })
      .subscribe(
        () => {
          this.group.channels = this.group.channels.filter((channel: any) => channel._id !== channelId);
        },
        err => {
          console.error('There was an error deleting the channel', err);
        }
      );
  }
  removeUser(userId: string): void {
    // Confirm if the user wants to remove the member
    if (confirm('Are you sure you want to remove this member?')) {
      this.http.delete(`http://localhost:3000/api/groups/${this.groupId}/users/${userId}`, { withCredentials: true })
        .subscribe(
          () => {
            // Remove the member from the local members list
            this.members = this.members.filter(member => member._id !== userId);
          },
          err => {
            console.error('There was an error removing the member', err);
          }
        );
    }
  }
}
