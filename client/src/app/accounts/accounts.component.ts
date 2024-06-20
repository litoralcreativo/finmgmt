import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../shared/services/account.service';
import { AccountListComponent } from './account-list/account-list.component';
import { AccountManagmentDialogComponent } from './account-managment-dialog/account-managment-dialog.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  @ViewChild(AccountListComponent) accountListComponent: AccountListComponent;
  constructor(private dialog: MatDialog, private accService: AccountService) {}

  ngOnInit(): void {}

  openNewAccountDialog() {
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
      });
  }
}
