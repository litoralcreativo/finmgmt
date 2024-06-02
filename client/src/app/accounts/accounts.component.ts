import { Component, OnInit } from '@angular/core';
import { AccountData, AccountType } from '../shared/models/accountData.model';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  accounts: AccountData[];
  sortedAccounts: { title: string; accounts: AccountData[] }[];
  sortBy?: 'amount' | 'type';
  hideEmpty: boolean = false;
  accountTypes: AccountType[] = [
    'digital wallet',
    'bank account',
    'broker',
    'cash',
  ];

  constructor() {}

  ngOnInit(): void {
    this.accounts = [
      {
        name: 'Mercado Pago',
        type: 'digital wallet',
        amount: 27546.19,
        symbol: 'ARS',
        favorite: true,
      },
      {
        name: 'Personal Pay',
        type: 'digital wallet',
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Santander',
        type: 'bank account',
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Ahorros',
        type: 'cash',
        amount: 6700,
        symbol: 'USD',
      },
      {
        name: 'BBVA',
        type: 'bank account',
        amount: 0,
        symbol: 'ARS',
      },
      {
        name: 'Bull Market 1',
        type: 'broker',
        amount: 3821458.18,
        symbol: 'ARS',
      },
      {
        name: 'Bull Market 2',
        type: 'broker',
        amount: 527222.84,
        symbol: 'ARS',
      },
      {
        name: 'Efectivo',
        type: 'cash',
        amount: 5400,
        symbol: 'ARS',
      },
    ];
    this.sortedAccounts = [
      {
        title: 'All accounts',
        accounts: this.accounts.sort((a, b) => {
          return a.amount < b.amount ? 1 : -1;
        }),
      },
    ];
  }

  sort(sortBy: 'amount' | 'type') {
    this.sortBy = sortBy;
    this.updateList();
  }

  updateList() {
    switch (this.sortBy) {
      case 'amount':
        this.sortedAccounts = [
          {
            title: 'All accounts',
            accounts: this.accounts
              .sort(this.sortByAmount)
              .filter(this.emptyPredicate),
          },
        ];
        break;
      case 'type':
        const types: string[] = [...new Set(this.accounts.map((x) => x.type))];

        this.sortedAccounts = types.map((type) => {
          const filtered = this.accounts.filter((x) => x.type === type);
          return {
            title: type,
            accounts: filtered
              .sort(this.sortByAmount)
              .filter(this.emptyPredicate),
          };
        });
        break;

      default:
        this.sortedAccounts = [
          {
            title: 'All accounts',
            accounts: this.accounts.filter(this.emptyPredicate),
          },
        ];
        break;
    }
  }

  /**
   * Returns a sorted copy of the array
   * @param acc Original array of AccountData
   */
  private sortByAmount = (a: AccountData, b: AccountData) => {
    return a.amount < b.amount ? 1 : -1;
  };

  private emptyPredicate = (x: AccountData) =>
    this.hideEmpty ? x.amount !== 0 : x;
}
