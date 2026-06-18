import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ResultService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  submitExam(data: { examId: string; answers: any[]; timeTakenSeconds: number; screenChanges?: number; autoSubmitted?: boolean }) {
    return this.http.post<any>(`${this.apiUrl}/results/submit`, data, { headers: this.headers });
  }

  getMyResults() {
    return this.http.get<any[]>(`${this.apiUrl}/results/my`, { headers: this.headers });
  }

  getMyResult(examId: string) {
    return this.http.get<any>(`${this.apiUrl}/results/my/${examId}`, { headers: this.headers });
  }

  getAllResults(examId?: string) {
    const url = examId
      ? `${this.apiUrl}/results?examId=${examId}`
      : `${this.apiUrl}/results`;
    return this.http.get<any[]>(url, { headers: this.headers });
  }

  getResult(id: string) {
    return this.http.get<any>(`${this.apiUrl}/results/${id}`, { headers: this.headers });
  }
}
