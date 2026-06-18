import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ResultService } from '../../../services/result.service';

@Component({
  selector: 'app-student-result-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-result-detail.component.html',
  styleUrls: ['./student-result-detail.component.css']
})
export class StudentResultDetailComponent implements OnInit {
  resultId: string = '';
  result: any = null;
  loading = true;

  correctCount = 0;
  incorrectCount = 0;
  unansweredCount = 0;
  percentage = 0;

  constructor(
    private route: ActivatedRoute,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    this.resultId = this.route.snapshot.paramMap.get('id') || '';
    if (this.resultId) {
      this.fetchResult();
    }
  }

  fetchResult() {
    this.resultService.getMyResults().subscribe({
      next: (results: any[]) => {
        this.result = results.find(r => r._id === this.resultId);
        if (this.result) {
          this.calculateStats();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats() {
    if (!this.result?.answers) return;
    
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.unansweredCount = 0;

    this.result.answers.forEach((ans: any) => {
      if (!ans.answer || ans.answer.trim() === '') {
        this.unansweredCount++;
      } else if (ans.isCorrect) {
        this.correctCount++;
      } else {
        this.incorrectCount++;
      }
    });

    const totalMarks = this.result.totalMarks || 1;
    this.percentage = Math.round((this.result.totalScore / totalMarks) * 100);
  }

  getDashOffset(): number {
    const totalLength = 125.66; // length of semi-circle path
    return totalLength - (totalLength * this.percentage / 100);
  }

  getGaugeColor(): string {
    if (this.percentage >= 70) return '#16a34a'; // green
    if (this.percentage >= 40) return 'var(--warning-color)'; // orange
    return '#ef4444'; // red
  }
}
