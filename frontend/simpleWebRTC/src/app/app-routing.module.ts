import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'; // Make sure to import RouterModule
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent,
  },
  {
    path: 'home', component: HomeComponent,
  },
  {
    path: 'register', component: RegisterComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes), // Add this line to import your routes
  ],
  exports: [RouterModule], // And this line to make router directives available for use in the AppModule components
})
export class AppRoutingModule {}
