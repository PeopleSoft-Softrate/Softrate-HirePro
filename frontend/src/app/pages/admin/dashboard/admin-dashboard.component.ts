import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ResultService } from '../../../services/result.service';
import { StudentService } from '../../../services/student.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  exams: any[] = [];
  results: any[] = [];
  students: any[] = [];
  loading = true;

  constructor(
    private examService: ExamService,
    private resultService: ResultService,
    private studentService: StudentService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    Promise.all([
      this.examService.getExams().toPromise(),
      this.resultService.getAllResults().toPromise(),
      this.studentService.getAllStudents().toPromise()
    ]).then(([exams, results, students]) => {
      this.exams = exams || [];
      this.results = results || [];
      this.students = students || [];
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  get activeExams() { return this.exams.filter(e => e.status === 'active').length; }
  get totalSubmissions() { return this.results.length; }
  get avgScore() {
    if (!this.results.length) return 0;
    const avg = this.results.reduce((sum, r) => sum + ((r.totalScore / (r.totalMarks || 1)) * 100), 0) / this.results.length;
    return Math.round(avg);
  }

  get recentResults() { return this.results.slice(0, 8); }

  getPercent(r: any) {
    return Math.round((r.totalScore / (r.totalMarks || 1)) * 100);
  }

  getScoreClass(r: any) {
    const pct = this.getPercent(r);
    if (pct >= 70) return 'good';
    if (pct >= 40) return 'average';
    return 'low';
  }

  formatTime(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
