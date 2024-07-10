import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AccountComponent } from './account/account.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [AccountsComponent, AccountComponent],
  imports: [CommonModule, AccountsRoutingModule, SharedModule],
})
export class AccountsModule {}
