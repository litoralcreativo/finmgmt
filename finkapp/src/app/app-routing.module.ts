import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
    component: HomeComponent,
  },
  {
    path: 'accounts',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
  {
    path: 'scopes',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
  {
    path: 'calendar',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
