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
  }

  fetchGroup(): void {
    this.http.get(`http://localhost:3000/api/groups/${this.groupId}`, { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.group = res;
          this.isMod = this.group.mods.includes(this.currentUserId);
        },
        err => {
          console.error('There was an error fetching the group', err);
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
}
