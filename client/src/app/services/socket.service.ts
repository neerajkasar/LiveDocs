import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001'); // Adjust if your backend URL is different
  }

  joinDocument(documentId: string): void {
    this.socket.emit('join-document', documentId);
  }

  sendDocumentChange(delta: any, documentId: string): void {
    this.socket.emit('doc-change', delta, documentId);
  }

  receiveDocumentChanges(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receive-changes', (delta) => {
        observer.next(delta);
      });
    });
  }

  saveDocument(data: { documentId: string, content: any }): void {
    this.socket.emit('save-document', data);
  }
}