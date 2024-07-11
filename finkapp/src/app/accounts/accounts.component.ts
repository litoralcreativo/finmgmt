import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent {
  constructor(private dialog: MatDialog, private accService: AccountService) {}

  openNewAccountDialog() {
    /* this.dialog
      .open(AccountManagmentDialogComponent, {
        width: '450px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          // this.accountListComponent?.fetchList();
          this.accService.getAccounts();
        }
      }); */
  }
}
