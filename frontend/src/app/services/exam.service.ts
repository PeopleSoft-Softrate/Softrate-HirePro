import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getExams() {
    return this.http.get<any[]>(`${this.apiUrl}/exams`, { headers: this.headers });
  }

  getExam(id: string) {
    return this.http.get<any>(`${this.apiUrl}/exams/${id}`, { headers: this.headers });
  }

  createExam(data: any) {
    return this.http.post<any>(`${this.apiUrl}/exams`, data, { headers: this.headers });
  }

  updateExam(id: string, data: any) {
    return this.http.put<any>(`${this.apiUrl}/exams/${id}`, data, { headers: this.headers });
  }

  deleteExam(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/exams/${id}`, { headers: this.headers });
  }
}
