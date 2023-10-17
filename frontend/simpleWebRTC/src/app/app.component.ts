import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'simpleWebRTC';
  constructor(private authService: AuthService) {
    // This will check the login status as soon as the app is initialized
    this.authService.checkLoginStatus();
  }
}