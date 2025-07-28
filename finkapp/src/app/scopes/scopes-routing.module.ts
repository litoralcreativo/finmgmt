import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScopeComponent } from './scope/scope.component';
import { ScopesComponent } from './scopes.component';
import { ScopeHistoryComponent } from './scope-history/scope-history.component';

const routes: Routes = [
  {
    path: '',
    component: ScopesComponent,
  },
  {
    path: ':scopeId',
    component: ScopeComponent
  },
  {
    path: ':scopeId/history',
    component: ScopeHistoryComponent,
    data: { breadcrumb: 'History' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScopesRoutingModule {}
