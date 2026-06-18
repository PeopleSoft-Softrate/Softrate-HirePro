import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = environment.apiUrl + '/students';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  register(data: {
    name: string; email: string; mobile: string;
    collegeName: string; department: string; graduationYear: number;
  }) {
    return this.http.post<any>(`${this.apiUrl}/students/register`, data);
  }

  getAllStudents() {
    return this.http.get<any[]>(`${this.apiUrl}/students`, { headers: this.headers });
  }
}
