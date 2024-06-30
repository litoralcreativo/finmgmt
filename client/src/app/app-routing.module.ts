import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/handlers/AuthGuard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
  },
  {
    path: 'accounts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
  },
  {
    path: 'scopes',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./scopes/scopes.module').then((m) => m.ScopeModule),
  },
  {
    path: 'calendar',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
