import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  name: string = ""; 
  email: string = ""; 
  password: string = "";

  constructor(private http: HttpClient) { } 

  ngOnInit(): void { 
  }

  register(): void {
    // Prepare the user data to send to the server.
    let bodyData = {
      "name": this.name,
      "email": this.email,
      "password": this.password,
      // "role": this.role  
    };
    
    // Make a POST request to the server to create a new user.
    this.http.post("http://localhost:3000/user/register", bodyData).subscribe(
      (resultData: any) => {
        console.log(resultData);
        alert("User Registered Successfully"); // Alert the user of successful registration.
      },
      (error: HttpErrorResponse) => { // Catch and log any errors from the server.
        console.error("There was an error!", error);
        
        // Check if the server sent a custom error message
        if (error.error && error.error.msg) {
          // Server returned a custom error message.
          alert(`An error occurred: ${error.error.msg}`);
        } else if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          alert(`An error occurred: ${error.error.message}`);
        } else {
          // The backend returned an unsuccessful response code.
          alert(`Backend returned code ${error.status}, ${error.error}`);
        }
      }
    );
  }

  save(): void {
    this.register(); // Attempt to register the user.
  }
}
