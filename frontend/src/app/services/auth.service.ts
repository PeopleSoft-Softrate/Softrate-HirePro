import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5001/api';
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): AuthUser | null {
    try {
      const u = localStorage.getItem('hp_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
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
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }
}
