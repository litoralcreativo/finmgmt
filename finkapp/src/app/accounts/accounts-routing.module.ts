import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountHistoryComponent } from './account-history/account-history.component';
import { AccountComponent } from './account/account.component';
import { AccountsComponent } from './accounts.component';

const routes: Routes = [
  {
    path: '',
    component: AccountsComponent,
    data: { breadcrumb: '' },
  },
  {
    path: ':accountId',
    component: AccountComponent,
    data: { breadcrumb: 'Account detail' },
  },
  {
    path: ':accountId/history',
    component: AccountHistoryComponent,
    data: { breadcrumb: 'History' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
