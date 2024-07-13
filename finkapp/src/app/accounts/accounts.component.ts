import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account.service';
import { AccountManagmentDialogComponent } from './account-managment-dialog/account-managment-dialog.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent {
  dialogOpened: boolean;
  constructor(private dialog: MatDialog, private accService: AccountService) {}

  openNewAccountDialog() {
    this.dialogOpened = true;
    this.dialog
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
      })
      .add(() => {
        this.dialogOpened = false;
      });
  }
}
