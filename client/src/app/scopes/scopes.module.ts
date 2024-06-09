import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScopesRoutingModule } from './scopes-routing.module';
import { ScopesComponent } from './scopes.component';
import { SharedModule } from '../shared/shared.module';
import { ScopeCardComponent } from './scope-card/scope-card.component';
import { ScopeComponent } from './scope/scope.component';

@NgModule({
  declarations: [ScopesComponent, ScopeCardComponent, ScopeComponent],
  imports: [CommonModule, ScopesRoutingModule, SharedModule],
})
export class ScopeModule {}
