import {Component, OnInit} from '@angular/core';
import {Emitters} from '../emitters/emitters';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  authenticated = false;
  user_name = '';
  user_role = '';

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
      }
    );
    this.http.get('http://localhost:3000/api/user', {withCredentials: true}).subscribe(
      (res: any) => {
        this.user_name = res.username;
        this.user_role = res.role;        
      }
    );
  }

  logout(): void {
    this.http.post('http://localhost:3000/api/logout', {}, {withCredentials: true})
      .subscribe(() => this.authenticated = false);
      localStorage.removeItem('user');
  }

}