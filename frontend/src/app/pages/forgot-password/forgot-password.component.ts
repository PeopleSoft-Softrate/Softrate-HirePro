import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  success = false;
  error = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.email) {
      this.error = 'Please enter your email address.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post('http://localhost:5001/api/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
