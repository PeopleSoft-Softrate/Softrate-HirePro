import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isAdmin()) return true;
  return auth.isLoggedIn()
    ? router.createUrlTree(['/student/dashboard'])
    : router.createUrlTree(['/login']);
};

export const studentGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isStudent()) return true;
  return auth.isLoggedIn()
    ? router.createUrlTree(['/admin/dashboard'])
    : router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  return auth.isAdmin()
    ? router.createUrlTree(['/admin/dashboard'])
    : router.createUrlTree(['/student/dashboard']);
};
