import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  documents: any[] = [];
  private apiUrl = 'http://localhost:3001/api/documents';

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadDocuments(): void {
    this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: (err) => {
        console.error('Failed to load documents', err);
      }
    });
  }

  createDocument(): void {
    this.http.post(this.apiUrl, { title: 'Untitled Document' }, { headers: this.getHeaders() }).subscribe({
      next: (newDoc: any) => {
        this.router.navigate(['/documents', newDoc._id]);
      },
      error: (err) => {
        console.error('Failed to create document', err);
      }
    });
  }

  openDocument(id: string): void {
    this.router.navigate(['/documents', id]);
  }

  logout(): void {
    this.authService.logout();
  }
}