import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ResultService } from '../../../services/result.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  exams: any[] = [];
  myResults: any[] = [];
  loading = true;
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get currentUser() { return this.auth.currentUser; }
  get userInitial() { return this.currentUser?.name?.charAt(0).toUpperCase() || 'S'; }
  get firstName() { return this.currentUser?.name?.split(' ')[0] || ''; }

  get greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  }

  get pendingExams() {
    return this.exams.filter(e => !this.hasAttempted(e._id));
  }

  get completedCount() { return this.myResults.length; }
  get pendingCount() { return this.pendingExams.length; }
  
  get averageScore() {
    if (this.myResults.length === 0) return 0;
    const sum = this.myResults.reduce((acc, r) => acc + this.getPercent(r), 0);
    return Math.round(sum / this.myResults.length);
  }

  get latestResult() {
    if (this.myResults.length === 0) return null;
    // Assuming results have a date. If not, just taking the last one in the array.
    return this.myResults[this.myResults.length - 1];
  }

  constructor(
    private examService: ExamService,
    private resultService: ResultService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    Promise.all([
      this.examService.getExams().toPromise(),
      this.resultService.getMyResults().toPromise()
    ]).then(([exams, results]) => {
      this.exams = exams || [];
      this.myResults = results || [];
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  hasAttempted(examId: string): boolean {
    return this.myResults.some(r => r.examId?._id === examId);
  }

  getResult(examId: string): any {
    return this.myResults.find(r => r.examId?._id === examId);
  }

  getPercent(r: any): number {
    return Math.round((r.totalScore / (r.totalMarks || 1)) * 100);
  }

  formatTime(secs: number): string {
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getScoreClass(r: any): string {
    const pct = this.getPercent(r);
    if (pct >= 70) return 'good';
    if (pct >= 40) return 'average';
    return 'low';
  }

  logout() {
    this.auth.logout();
  }
}
