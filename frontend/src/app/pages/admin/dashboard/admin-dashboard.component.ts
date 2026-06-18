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
  get currentDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get lineChartPath() {
    if (this.results.length === 0) return 'M0,120 Q100,120 200,120 T400,120 T600,120 T800,120';
    // Generate a simple cubic bezier curve through the last 5 results' scores mapped to 0-150 Y height.
    const last5 = this.results.slice(-5).map(r => this.getPercent(r));
    while (last5.length < 5) last5.unshift(50); // padding

    // Y varies inversely with score (100 score = 20 Y, 0 score = 140 Y)
    const mapY = (score: number) => 140 - (score * 1.2);
    
    return `M0,${mapY(last5[0])} Q100,${mapY(last5[1])} 200,${mapY(last5[2])} T400,${mapY(last5[3])} T600,${mapY(last5[4])} T800,${mapY(last5[4])}`;
  }

  get radarPoints() {
    if (this.results.length === 0) return '50,10 90,50 50,90 10,50';

    const sectionStats = [
      { correct: 0, total: 0 },
      { correct: 0, total: 0 },
      { correct: 0, total: 0 },
      { correct: 0, total: 0 }
    ];

    this.results.forEach(r => {
      r.answers?.forEach((a: any) => {
        const sIdx = a.sectionIndex || 0;
        if (sIdx >= 0 && sIdx < 4) {
          sectionStats[sIdx].total++;
          if (a.isCorrect || a.marksEarned > 0) {
            sectionStats[sIdx].correct++;
          }
        }
      });
    });

    const getScore = (idx: number) => {
       const stat = sectionStats[idx];
       return stat.total === 0 ? 0 : (stat.correct / stat.total) * 100;
    };

    const s1 = getScore(0);
    const s2 = getScore(1);
    const s3 = getScore(2);
    const s4 = getScore(3);

    // If no section data is available, fallback to a small centered diamond instead of full size
    if (s1 === 0 && s2 === 0 && s3 === 0 && s4 === 0) {
       return '50,45 55,50 50,55 45,50';
    }

    // Map 0-100 to radar polygon coordinates (center is 50,50, max radius 40)
    const top = 50 - (s1 * 0.4);
    const right = 50 + (s2 * 0.4);
    const bottom = 50 + (s3 * 0.4);
    const left = 50 - (s4 * 0.4);

    return `50,${top} ${right},50 50,${bottom} ${left},50`;
  }
}
