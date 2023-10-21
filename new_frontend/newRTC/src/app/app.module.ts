import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { RequestService } from './services/request.service';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RegisterComponent} from './register/register.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { PromoteUserComponent } from './promote-user/promote-user.component';
import { GroupChannelsComponent } from './group-channels/group-channels.component';
import { RequestsComponent } from './requests/requests.component';
import { UserListComponent } from './user-list/user-list.component';
import { ChannelComponent } from './channel/channel.component';
import { UserGroupsComponent } from './user-groups/user-groups.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HomeComponent,
    NavbarComponent,
    PromoteUserComponent,
    GroupChannelsComponent,
    RequestsComponent,
    UserListComponent,
    ChannelComponent,
    UserGroupsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [RequestService],
  bootstrap: [AppComponent]
})
export class AppModule {
}