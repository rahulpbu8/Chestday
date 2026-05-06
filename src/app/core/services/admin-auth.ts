import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminAuth {
  private api = inject(ApiService);
  private router = inject(Router);
  
  public adminSubject = new BehaviorSubject<any>(null);
  admin$ = this.adminSubject.asObservable();

  constructor() {
    const savedToken = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_user');
    if (savedToken && savedAdmin) {
      this.adminSubject.next(JSON.parse(savedAdmin));
    }
  }

  get admin() {
    return this.adminSubject.value;
  }

  isEliteAdmin(): boolean {
    return this.admin?.role === 'super_admin';
  }

  login(credentials: { email: string; password: any }) {
    return this.api.post<any>('auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('admin_token', response.access_token);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
        this.adminSubject.next(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.adminSubject.next(null);
    this.router.navigate(['/admin/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  }
}
