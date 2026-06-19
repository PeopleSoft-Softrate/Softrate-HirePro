import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrap">
      <div class="page-head">
        <div><h1>Students</h1><p>All registered candidates</p></div>
        <span class="count-badge">{{ students.length }} students</span>
      </div>
      <div class="loading-state" *ngIf="loading"><div class="spinner"></div><p>Loading...</p></div>
      <div class="requests-table-wrapper" *ngIf="!loading && students.length > 0">
        <table class="requests-table">
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>College</th><th>Department</th><th>Grad Year</th><th>Registered</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of students; let i = index">
              <td class="td-num">{{ i + 1 }}</td>
              <td><div class="tbl-person"><div class="tbl-avatar onboarding">{{ (s.name || 'U')[0] }}</div><div class="tbl-name">{{ s.name }}</div></div></td>
              <td class="tbl-text">{{ s.email }}</td>
              <td class="tbl-text">{{ s.mobile || '-' }}</td>
              <td class="tbl-text">{{ s.collegeId?.name || '-' }}</td>
              <td class="tbl-text">{{ s.department || '-' }}</td>
              <td class="tbl-text">{{ s.graduationYear || '-' }}</td>
              <td class="tbl-date">{{ s.createdAt | date:'dd MMM yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty-state" *ngIf="!loading && students.length === 0">
        <p>No students registered yet.</p>
      </div>
    </div>
  `,
  styles: [`.page-wrap{padding:2rem}.page-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem}.page-head h1{font-size:1.75rem;font-weight:700;color:var(--text-primary);margin-bottom:.2rem}.page-head p{color:var(--text-secondary);font-size:.875rem}.count-badge{background:#dbeafe;color:#1d4ed8;font-size:.8125rem;font-weight:700;padding:.3rem .875rem;border-radius:999px;align-self:center}.loading-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem;gap:1rem;color:var(--text-muted)}.td-num{color:var(--text-muted);font-size:.8125rem;width:40px}.empty-state{text-align:center;padding:4rem;color:var(--text-muted)}@media(max-width:600px){.page-wrap{padding:1rem}}`]
})
export class AdminStudentsComponent implements OnInit {
  students: any[] = [];
  loading = true;
  constructor(private studentService: StudentService) {}
  ngOnInit() {
    this.studentService.getAllStudents().subscribe({
      next: (s) => { this.students = s; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
