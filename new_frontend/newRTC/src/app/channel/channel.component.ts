import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-channel',
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit {
  channelId: string = '';
  groupId: string = '';
  channel: any = {}; // Channel information
  members: any[] = []; // Member list

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.channelId = this.route.snapshot.paramMap.get('channelId') || '';

    // Fetch information
    this.fetchChannelInfo();
    this.fetchMembers();
  }

  fetchChannelInfo(): void {
    this.http.get(`http://localhost:3000/api/groups/${this.groupId}/channels/${this.channelId}/`, { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.channel = res.channel;
          console.log("this.channel: ",this.channel);
        },
        err => {
          console.error('There was an error fetching channel information', err);
        }
      );
  }
  fetchMembers(): void {
    this.http.get(`http://localhost:3000/api/groups/${this.groupId}/channels/${this.channelId}/members`, { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.members = res.members;
          console.log("fetched mems: ",this.members)
        },
        err => {
          console.error('There was an error fetching channel members', err);
        }
      );
  }
}
