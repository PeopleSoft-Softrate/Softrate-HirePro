import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ResultService } from '../../../services/result.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-results.component.html',
  styleUrls: ['./admin-results.component.css']
})
export class AdminResultsComponent implements OnInit {
  results: any[] = [];
  exams: any[] = [];
  filteredResults: any[] = [];
  selectedExamId = '';
  loading = true;

  constructor(
    private resultService: ResultService,
    private examService: ExamService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    Promise.all([
      this.resultService.getAllResults().toPromise(),
      this.examService.getExams().toPromise()
    ]).then(([results, exams]) => {
      this.results = results || [];
      this.exams = exams || [];
      this.filteredResults = this.results;
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  filterByExam(examId: string) {
    this.selectedExamId = examId;
    this.filteredResults = examId
      ? this.results.filter(r => r.examId?._id === examId)
      : this.results;
  }

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
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
