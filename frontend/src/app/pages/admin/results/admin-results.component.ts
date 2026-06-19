import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { ResultService } from '../../../services/result.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-results.component.html',
  styleUrls: ['./admin-results.component.css']
})
export class AdminResultsComponent implements OnInit {
  results: any[] = [];
  exams: any[] = [];
  filteredResults: any[] = [];
  colleges: string[] = [];

  filters = {
    examId: '',
    college: '',
    maxWarnings: null as number | null,
    minMarks: null as number | null,
    topN: null as number | null
  };
  
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
      
      const allColleges = this.results
        .map(r => r.studentId?.collegeId?.name)
        .filter(c => !!c);
      this.colleges = [...new Set(allColleges)].sort();
      
      this.filteredResults = this.results;
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  applyFilters() {
    let filtered = this.results;

    if (this.filters.examId) {
      filtered = filtered.filter(r => r.examId?._id === this.filters.examId);
    }
    if (this.filters.college) {
      filtered = filtered.filter(r => r.studentId?.collegeId?.name === this.filters.college);
    }
    if (this.filters.maxWarnings !== null && this.filters.maxWarnings !== undefined) {
      filtered = filtered.filter(r => (r.screenChanges || 0) <= this.filters.maxWarnings!);
    }
    if (this.filters.minMarks !== null && this.filters.minMarks !== undefined) {
      filtered = filtered.filter(r => r.totalScore >= this.filters.minMarks!);
    }

    filtered.sort((a, b) => b.totalScore - a.totalScore);

    if (this.filters.topN !== null && this.filters.topN !== undefined && this.filters.topN > 0) {
      filtered = filtered.slice(0, this.filters.topN);
    }

    this.filteredResults = filtered;
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

  exportCSV() {
    if (this.filteredResults.length === 0) return;
    
    const headers = ['Student Name', 'Email', 'College', 'Department', 'Exam', 'Score', 'Total Marks', 'Percentage', 'Time Taken (seconds)', 'Malpractice Warnings', 'Submitted At'];
    
    const rows = this.filteredResults.map(r => {
      const name = (r.studentId?.name || '').replace(/"/g, '""');
      const email = (r.studentId?.email || '').replace(/"/g, '""');
      const college = (r.studentId?.collegeId?.name || '').replace(/"/g, '""');
      const dept = (r.studentId?.department || '').replace(/"/g, '""');
      const exam = (r.examId?.title || '').replace(/"/g, '""');
      const score = r.totalScore || 0;
      const marks = r.totalMarks || 1;
      const pct = this.getPercent(r);
      const time = r.timeTakenSeconds || 0;
      const warnings = r.screenChanges || 0;
      const submitted = this.formatDate(r.submittedAt).replace(/"/g, '""');
      
      return [
        `"${name}"`, `"${email}"`, `"${college}"`, `"${dept}"`, `"${exam}"`, 
        score, marks, `${pct}%`, time, warnings, `"${submitted}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exam_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
