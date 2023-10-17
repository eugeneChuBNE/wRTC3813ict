import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component'; 
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  {
    path: '', component: HomeComponent, // HomeComponent is now the default route
  },
  {
    path: 'login', component: LoginComponent, // adjusted path
  },
  {
    path: 'register', component: RegisterComponent, // adjusted path
  },
  {
    path: 'dashboard', component: DashboardComponent, // new route for DashboardComponent
    canActivate: [AuthGuard]
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
