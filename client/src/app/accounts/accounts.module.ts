import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { SharedModule } from '../shared/shared.module';
import { AccountCardComponent } from './account-card/account-card.component';

@NgModule({
  declarations: [AccountsComponent, AccountCardComponent],
  imports: [CommonModule, AccountsRoutingModule, SharedModule],
})
export class AccountsModule {}
