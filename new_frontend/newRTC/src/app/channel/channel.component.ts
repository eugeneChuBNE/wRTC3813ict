import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../services/socket.service';
import { AuthService } from '../services/auth.service';

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
  messages: string[] = []; // Store incoming chat messages
  newMessage = {
    content: ''
  };
  currentUserId: string | null = null;
  private messageSubscription: any; 

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private socketService: SocketService,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('groupId') || '';
    this.channelId = this.route.snapshot.paramMap.get('channelId') || '';
    const currentUser = this.authService.currentUserValue;
    console.log("current u: ",currentUser);
    this.currentUserId = currentUser._id;
    console.log("c i",this.currentUserId);

    this.initSocketConnection();

    // Fetch information
    this.fetchChannelInfo();
    this.fetchMembers();
  }


  private initSocketConnection() {
    this.socketService.initSocket();
    this.socketService.getMessage().subscribe((message: any) => {
      this.messages.push(message.content);
      console.log("Received message:", message.content);
    });    
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

  sendMessage(): void {
    if (this.newMessage.content.trim()) {
        console.log("Sending Message:", this.newMessage);
        
        // Create a message object
        const messageObj = {
            sender: this.currentUserId,
            content: this.newMessage.content,
            channelId: this.channelId,
        };
        
        this.socketService.send(messageObj);
        this.newMessage.content = ''; // reset the message content
    }
}
}
