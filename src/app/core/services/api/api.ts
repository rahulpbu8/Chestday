import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) { }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Static assets are NOT prefixed with /api
    const rootUrl = this.baseUrl.replace('/api', '');
    return `${rootUrl}${imagePath}`;
  }

  private getHeaders() {
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('access_token');
    // If we're not explicitly in the admin area, prioritize user token
    const token = (!window.location.pathname.includes('/admin') && userToken) ? userToken : (adminToken || userToken);
    
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      }
    };
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, this.getHeaders());
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, this.getHeaders());
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, this.getHeaders());
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, this.getHeaders());
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, this.getHeaders());
  }
}
