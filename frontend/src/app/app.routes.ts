import { Routes } from '@angular/router';
import { authGuard, adminGuard, studentGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard]
  },

  // Public routes (redirect if logged in)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'student/register',
    loadComponent: () => import('./pages/student/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Admin routes (inside layout)
  {
    path: 'admin',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'exams',
        loadComponent: () => import('./pages/admin/exams/admin-exams.component').then(m => m.AdminExamsComponent)
      },
      {
        path: 'exams/create',
        loadComponent: () => import('./pages/admin/create-exam/create-exam.component').then(m => m.CreateExamComponent)
      },
      {
        path: 'exams/:id/edit',
        loadComponent: () => import('./pages/admin/create-exam/create-exam.component').then(m => m.CreateExamComponent)
      },
      {
        path: 'exams/:id/add-user',
        loadComponent: () => import('./pages/admin/add-college-user/add-college-user.component').then(m => m.AddCollegeUserComponent)
      },
      {
        path: 'results',
        loadComponent: () => import('./pages/admin/results/admin-results.component').then(m => m.AdminResultsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/admin/students/admin-students.component').then(m => m.AdminStudentsComponent)
      }
    ]
  },

  // Student routes (inside layout)
  {
    path: 'student',
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [studentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'results',
        loadComponent: () => import('./pages/student/results/student-results.component').then(m => m.StudentResultsComponent)
      },
      {
        path: 'result/:id',
        loadComponent: () => import('./pages/student/result-detail/student-result-detail.component').then(m => m.StudentResultDetailComponent)
      }
    ]
  },

  // Exam route — no layout/sidebar (fullscreen)
  {
    path: 'student/exam/:id',
    loadComponent: () => import('./pages/student/take-exam/take-exam.component').then(m => m.TakeExamComponent),
    canActivate: [studentGuard]
  },

  { path: '**', redirectTo: '/login' }
];
