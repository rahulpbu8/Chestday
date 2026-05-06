import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private api: ApiService) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.api.post<any>('auth/login', { email, password })
      .pipe(tap((response: any) => {
        if (response && response.access_token) {
          const user = response.user;
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('access_token', response.access_token);
          this.currentUserSubject.next(user);
        }
      }));
  }

  register(user: any): Observable<any> {
    return this.api.post<any>('users', user);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}

