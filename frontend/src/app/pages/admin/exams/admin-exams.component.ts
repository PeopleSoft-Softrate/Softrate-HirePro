import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-exams.component.html',
  styleUrls: ['./admin-exams.component.css']
})
export class AdminExamsComponent implements OnInit {
  exams: any[] = [];
  loading = true;
  deletingId = '';

  constructor(private examService: ExamService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.examService.getExams().subscribe({
      next: (e) => { this.exams = e; this.loading = false; },
      error: () => this.loading = false
    });
  }

  toggleStatus(exam: any) {
    const newStatus = exam.status === 'active' ? 'draft' : 'active';
    this.examService.updateExam(exam._id, { status: newStatus }).subscribe({
      next: () => exam.status = newStatus,
      error: (err) => alert(err.error?.message || 'Failed to update status')
    });
  }

  deleteExam(id: string) {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    this.deletingId = id;
    this.examService.deleteExam(id).subscribe({
      next: () => {
        this.exams = this.exams.filter(e => e._id !== id);
        this.deletingId = '';
      },
      error: () => this.deletingId = ''
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
