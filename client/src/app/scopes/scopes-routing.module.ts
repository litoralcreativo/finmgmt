import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScopeComponent } from './scope/scope.component';
import { ScopesComponent } from './scopes.component';

const routes: Routes = [
  {
    path: '',
    component: ScopesComponent,
  },
  {
    path: ':scopeId',
    component: ScopeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScopesRoutingModule {}
