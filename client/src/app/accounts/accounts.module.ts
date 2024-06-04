import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { SharedModule } from '../shared/shared.module';
import { AccountCardComponent } from './account-card/account-card.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountManagmentDialogComponent } from './account-managment-dialog/account-managment-dialog.component';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AccountCardComponent,
    AccountListComponent,
    AccountManagmentDialogComponent,
    AccountComponent,
  ],
  imports: [CommonModule, AccountsRoutingModule, SharedModule],
})
export class AccountsModule {}
