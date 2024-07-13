import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AccountComponent } from './account/account.component';
import { AccountCardComponent } from './account-card/account-card.component';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountFABComponent } from './account-fab/account-fab.component';
import { AccountHistoryComponent } from './account-history/account-history.component';
import { AccountManagmentDialogComponent } from './account-managment-dialog/account-managment-dialog.component';

@NgModule({
  declarations: [
    AccountsComponent,
    AccountComponent,
    AccountCardComponent,
    AccountListComponent,
    AccountFABComponent,
    AccountHistoryComponent,
    AccountManagmentDialogComponent,
  ],
  imports: [CommonModule, AccountsRoutingModule, SharedModule],
})
export class AccountsModule {}
