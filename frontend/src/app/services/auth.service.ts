import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): AuthUser | null {
    try {
      const token = localStorage.getItem('hp_token');
      const u = localStorage.getItem('hp_user');
      if (token && u) return JSON.parse(u);
      return null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; user: AuthUser }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('hp_token', res.token);
          localStorage.setItem('hp_user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        })
      );
  }

  logout() {
    localStorage.removeItem('hp_token');
    localStorage.removeItem('hp_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('hp_token');
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value && !!localStorage.getItem('hp_token');
  }

  isAdmin(): boolean {
    return this.userSubject.value?.role === 'admin';
  }

  isStudent(): boolean {
    return this.userSubject.value?.role === 'student';
  }
}
