import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScopesRoutingModule } from './scopes-routing.module';
import { ScopesComponent } from './scopes.component';
import { SharedModule } from '../shared/shared.module';
import { ScopeCardComponent } from './scope-card/scope-card.component';
import { ScopeComponent } from './scope/scope.component';
import { ScopeManagmentDialogComponent } from './scope-managment-dialog/scope-managment-dialog.component';

@NgModule({
  declarations: [ScopesComponent, ScopeCardComponent, ScopeComponent, ScopeManagmentDialogComponent],
  imports: [CommonModule, ScopesRoutingModule, SharedModule],
})
export class ScopeModule {}
