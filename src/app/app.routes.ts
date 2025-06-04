import {Routes} from '@angular/router';
import {PageNotFoundComponent} from './shared/components/page-not-found/page-not-found.component';
import {NoAuthGuard} from './modules/auth/guards/no-auth.guard';
import {AuthGuard} from './modules/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [NoAuthGuard],
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'movements',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/movements/movements.routes').then(m => m.MOVEMENTS_ROUTES),
  },
  {
    path: 'customers',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/customers/customers.routes').then(m => m.CUSTOMERS_ROUTES),
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/projects/projects.routes').then(m => m.PROJECTS_ROUTES),
  },
  {
    path: '', redirectTo: 'auth', pathMatch: 'full',
  },
  {
    path: '**', component: PageNotFoundComponent
  }
];
