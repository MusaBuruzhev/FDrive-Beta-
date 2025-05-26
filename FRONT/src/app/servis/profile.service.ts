import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/profile/update`, data, {
      headers: this.getAuthHeaders()
    });
  }

  uploadDocuments(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/profile/update`, formData, {
      headers: this.getAuthHeaders(false)
    });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/users/me`, {
      headers: this.getAuthHeaders()
    });
  }

  getUnverifiedDocuments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/document/documents`, {
      headers: this.getAuthHeaders()
    });
  }

  moderateDocuments(userId: string, action: 'approve' | 'reject'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/document/documents/${userId}`, { action }, {
      headers: this.getAuthHeaders()
    });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/users`, {
      headers: this.getAuthHeaders()
    });
  }
  clearDocuments(): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/profile/update`, { passportFiles: [] }, {
    headers: this.getAuthHeaders()
  });
}

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/auth/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(includeJson = true): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    if (includeJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
}
