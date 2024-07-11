import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/handlers/AuthGuard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' },
  },
  {
    path: 'accounts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
    data: { breadcrumb: 'Accounts' },
  },
  {
    path: 'scopes',
    canActivate: [AuthGuard],
    component: DashboardComponent,
    data: { breadcrumb: 'Scopes' },
  },
  {
    path: 'calendar',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
    data: { breadcrumb: 'Calendar' },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
