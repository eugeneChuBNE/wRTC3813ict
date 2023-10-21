import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PromoteUserComponent } from './promote-user/promote-user.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { BrowserModule } from '@angular/platform-browser';
import { GroupChannelsComponent } from './group-channels/group-channels.component';
import { RequestsComponent } from './requests/requests.component';

const routes: Routes = [
  {path:"", component: HomeComponent},
  {path:"login", component: LoginComponent},
  {path:"register", component: RegisterComponent},
  { path: 'promote-user', component: PromoteUserComponent },
  { path: 'group/:groupId/channels', component: GroupChannelsComponent },
  { path: 'requests', component: RequestsComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    BrowserModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
