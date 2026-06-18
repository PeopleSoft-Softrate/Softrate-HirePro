import { Routes } from '@angular/router';
import { authGuard, adminGuard, studentGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

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
        path: 'exam/:id',
        loadComponent: () => import('./pages/student/take-exam/take-exam.component').then(m => m.TakeExamComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
