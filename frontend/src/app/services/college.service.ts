import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface College {
  _id?: string;
  name: string;
  affiliation?: string;
  state?: string;
  city?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CollegeService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getColleges() {
    return this.http.get<College[]>(`${environment.apiUrl}/colleges`, { headers: this.headers });
  }

  createCollege(data: College) {
    return this.http.post<College>(`${environment.apiUrl}/colleges`, data, { headers: this.headers });
  }
}
