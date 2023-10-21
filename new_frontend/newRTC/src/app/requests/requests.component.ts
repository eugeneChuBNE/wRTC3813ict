import { Component, OnInit } from '@angular/core';
import { RequestService } from '../services/request.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  joinRequests: any[] = [];

  constructor(private requestService: RequestService) { }

  ngOnInit(): void {
    this.fetchJoinRequests();
  }

  fetchJoinRequests(): void {
    this.requestService.getJoinRequests().subscribe(
      data => {
        this.joinRequests = data.requests; // adapt if the API response structure is different
      },
      error => {
        console.error('There was an error fetching the join requests', error);
      }
    );
  }

  approveRequest(requestId: string): void {
    this.requestService.approveRequest(requestId).subscribe(
      res => {
        console.log('Request approved', res);
        this.joinRequests = this.joinRequests.filter(request => request._id !== requestId);
      },
      error => {
        console.error('There was an error approving the request', error);
      }
    );
  }

  declineRequest(requestId: string): void {
    this.requestService.declineRequest(requestId).subscribe(
      res => {
        console.log('Request declined', res);
        this.joinRequests = this.joinRequests.filter(request => request._id !== requestId);
      },
      error => {
        console.error('There was an error declining the request', error);
      }
    );
  }
}
