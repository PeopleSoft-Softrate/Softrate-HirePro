import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = {
    name: '',
    email: '',
    mobile: '',
    collegeName: '',
    department: '',
    graduationYear: new Date().getFullYear()
  };
  loading = false;
  error = '';
  success = false;

  constructor(private studentService: StudentService) {}

  get currentYear() { return new Date().getFullYear(); }

  onSubmit() {
    const { name, email, mobile, collegeName, department, graduationYear } = this.form;
    if (!name || !email || !mobile || !collegeName || !department || !graduationYear) {
      this.error = 'Please fill all fields.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.studentService.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
