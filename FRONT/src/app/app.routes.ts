import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogComponent } from './catalog/catalog.component';
import { AuthComponent } from './auth/auth.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

const isAdmin = () => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  return payload?.roles?.includes('ADMIN');
};

const redirect = (target: 'admin' | 'profile') => {
  const router = inject(Router);
  const isToken = !!localStorage.getItem('token');
  if (!isToken) {
    router.navigate(['/auth']);
    return false;
  }
  if (target === 'admin' && !isAdmin()) {
    router.navigate(['/profile']);
    return false;
  }
  if (target === 'profile' && isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'auth', component: AuthComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [() => redirect('profile')]
  },
  {
    path: 'admin',
    component: ProfileComponent,
    canActivate: [() => redirect('admin')]
  },
  {
  path: 'product/:id',
  loadComponent: () => import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent)
}

];
