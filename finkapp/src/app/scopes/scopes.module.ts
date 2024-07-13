import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScopesRoutingModule } from './scopes-routing.module';
import { ScopesComponent } from './scopes.component';
import { SharedModule } from '../shared/shared.module';
import { ScopeListComponent } from './scope-list/scope-list.component';
import { ScopeCardComponent } from './scope-card/scope-card.component';
import { ScopeManagmentDialogComponent } from './scope-managment-dialog/scope-managment-dialog.component';

@NgModule({
  declarations: [
    ScopesComponent,
    ScopeListComponent,
    ScopeCardComponent,
    ScopeManagmentDialogComponent,
  ],
  imports: [CommonModule, ScopesRoutingModule, SharedModule],
})
export class ScopesModule {}
