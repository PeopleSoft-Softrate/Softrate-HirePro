import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  sidebarOpen = true;

  constructor(public auth: AuthService, private router: Router) {}

  get user() { return this.auth.currentUser; }
  get isAdmin() { return this.auth.isAdmin(); }

  adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/admin/exams', label: 'Exams', icon: 'file-text' },
    { path: '/admin/results', label: 'Results', icon: 'bar-chart' },
    { path: '/admin/students', label: 'Students', icon: 'users' },
  ];

  studentLinks = [
    { path: '/student/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/student/results', label: 'My Results', icon: 'bar-chart' },
  ];

  get navLinks() {
    return this.isAdmin ? this.adminLinks : this.studentLinks;
  }

  logout() { this.auth.logout(); }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
      'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
      'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    };
    return icons[name] || '';
  }
}
