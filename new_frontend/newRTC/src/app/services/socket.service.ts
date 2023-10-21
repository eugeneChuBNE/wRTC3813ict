import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io, { Socket } from 'socket.io-client';

const SERVER_URL = "http://localhost:3000";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket; // Using Non-null Assertion Operator

  constructor() { }

  // Setup connection to socket server
  initSocket(): void {
    console.log("Initializing Socket...");
    this.socket = io(SERVER_URL);

    this.socket.on('connect', () => {
        console.log('Connected to the server.');
    });

    this.socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from the server. Reason:', reason);
    });
  }


  // Emit a message to the socket server
  send(message: any): void {
    this.socket.emit('message', message);
  }
  
  // Listen for "message" events from the socket server
  getMessage(): Observable<string> {
    return new Observable(observer => {
      this.socket.on('message', (data: string) => { 
        observer.next(data); 
      });
    });
  }
}