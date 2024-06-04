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
  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    /* this.accounts = [
      {
        name: 'Mercado Pago',
        type: AccountType.DIGITAL_WALLET,
        amount: 27546.19,
        symbol: 'ARS',
        favorite: true,
      },
      {
        name: 'NaranjaX',
        type: AccountType.DIGITAL_WALLET,
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Personal Pay',
        type: AccountType.DIGITAL_WALLET,
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Santander',
        type: AccountType.BANK_ACCOUNT,
        amount: 40344.45,
        symbol: 'ARS',
      },
      {
        name: 'Ahorros',
        type: AccountType.CASH,
        amount: 200,
        symbol: 'USD',
      },
      {
        name: 'BBVA',
        type: AccountType.BANK_ACCOUNT,
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Bull Market 1',
        type: AccountType.BROKER,
        amount: 3821458.18,
        symbol: 'ARS',
      },
      {
        name: 'Bull Market 2',
        type: AccountType.BROKER,
        amount: 527222.84,
        symbol: 'ARS',
      },
      {
        name: 'Efectivo',
        type: AccountType.CASH,
        amount: 5400,
        symbol: 'ARS',
      },
    ]; */
  }

  openNewAccountDialog() {
    this.dialog
      .open(AccountManagmentDialogComponent, {
        width: '450px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.accountListComponent?.fetchList();
        }
      });
  }
}
