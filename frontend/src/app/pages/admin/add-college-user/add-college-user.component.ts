import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CollegeService, College } from '../../../services/college.service';

@Component({
  selector: 'app-add-college-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-college-user.component.html',
  styleUrls: ['./add-college-user.component.css']
})
export class AddCollegeUserComponent implements OnInit {
  examId: string | null = null;
  showPassword = false;
  loading = false;
  error = '';
  
  // Phase 1: College Selection / Creation
  phase: 1 | 2 = 1;
  colleges: College[] = [];
  selectedCollegeId: string = '';
  isAddingNewCollege = false;
  
  newCollegeData: College = {
    name: '',
    affiliation: '',
    state: '',
    city: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  };

  // Phase 2: Student Creation
  formData = {
    fullName: '',
    rollNumber: '',
    password: '',
    mobile: '',
    gradYear: '',
    department: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private collegeService: CollegeService
  ) {}

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id');
    this.loadColleges();
  }

  loadColleges() {
    this.collegeService.getColleges().subscribe({
      next: (data) => {
        this.colleges = data;
      },
      error: (err) => console.error('Failed to load colleges', err)
    });
  }

  goBack() {
    if (this.phase === 2 && !this.isAddingNewCollege) {
      this.phase = 1; // Go back to step 1
    } else {
      this.router.navigate(['/admin/exams']);
    }
  }

  onNextToStep2() {
    if (this.isAddingNewCollege) {
      if (!this.newCollegeData.name) {
        alert('College Name is required');
        return;
      }
      this.loading = true;
      this.collegeService.createCollege(this.newCollegeData).subscribe({
        next: (college) => {
          this.loading = false;
          this.colleges.push(college);
          this.selectedCollegeId = college._id!;
          this.phase = 2;
          this.isAddingNewCollege = false;
        },
        error: (err) => {
          this.loading = false;
          alert(err.error?.message || 'Failed to create college');
        }
      });
    } else {
      if (!this.selectedCollegeId) {
        alert('Please select a college');
        return;
      }
      this.phase = 2;
    }
  }

  getSelectedCollegeName() {
    const c = this.colleges.find(c => c._id === this.selectedCollegeId);
    return c ? c.name : '';
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const payload = {
      name: this.formData.fullName,
      email: this.formData.rollNumber,
      password: this.formData.password,
      mobile: this.formData.mobile,
      graduationYear: this.formData.gradYear,
      collegeId: this.selectedCollegeId,
      examId: this.examId,
      department: this.formData.department
    };

    this.http.post<{message: string}>(`${environment.apiUrl}/students/register`, payload).subscribe({
      next: (res) => {
        this.loading = false;
        alert(res.message || 'User added successfully!');
        this.goBack();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to add user. Please try again.';
        alert(this.error);
      }
    });
  }
}
