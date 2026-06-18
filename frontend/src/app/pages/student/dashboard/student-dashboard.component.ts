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

  getScoreClass(r: any): string {
    const pct = this.getPercent(r);
    if (pct >= 70) return 'good';
    if (pct >= 40) return 'average';
    return 'low';
  }
}
