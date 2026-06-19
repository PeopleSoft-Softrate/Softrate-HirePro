// Force rebuild
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResultService } from '../../../services/result.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-results.component.html',
  styleUrls: ['./student-results.component.css']
})
export class StudentResultsComponent implements OnInit {
  results: any[] = [];
  loading = true;
  expandedId: string | null = null;
  showLogout = environment.showLogout;
  sidebarOpen = true;

  constructor(private resultService: ResultService, public auth: AuthService) {}

  get currentUser() { return this.auth.currentUser; }
  get userInitial() { return this.currentUser?.name?.charAt(0).toUpperCase() || 'S'; }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {
    this.resultService.getMyResults().subscribe({
      next: (r) => { this.results = r; this.loading = false; },
      error: () => this.loading = false
    });
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

  formatTime(secs: number): string {
    if (!secs) return '-';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  toggleExpand(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  getSectionScore(result: any, sIdx: number): number {
    return result.answers
      .filter((a: any) => a.sectionIndex === sIdx)
      .reduce((sum: number, a: any) => sum + (a.marksEarned || 0), 0);
  }

  getSectionTotal(result: any, sIdx: number): number {
    const section = result.examId?.sections?.[sIdx];
    if (!section) return 0;
    return section.questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
  }
}
