import { Component, OnInit } from '@angular/core';
import { AccountData, AccountType } from '../shared/models/accountData.model';
import { SymbolChangeService } from '../shared/services/symbol-change.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit {
  accounts: AccountData[];
  sortedAccounts: { title: string; accounts: AccountData[]; sum: number }[];
  hideEmpty: boolean = false;
  accountTypes: AccountType[] = [
    AccountType.DIGITAL_WALLET,
    AccountType.BANK_ACCOUNT,
    AccountType.BROKER,
    AccountType.CASH,
  ];
  selectedAccountTypes: AccountType[] = [...this.accountTypes];

  constructor(private symbolChangeService: SymbolChangeService) {}

  ngOnInit(): void {
    this.accounts = [
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
    ];
    this.updateList();
  }

  updateList() {
    const types: string[] = [
      ...new Set(this.accounts.map((x) => x.type)),
    ].filter((x) => this.selectedAccountTypes.includes(x));

    this.sortedAccounts = types
      .map((type) => {
        const filtered = this.accounts
          .filter((x) => x.type === type)
          .sort(this.compareByAmount)
          .filter(this.emptyPredicate);

        return {
          title: type,
          sum: this.totalAmount(filtered),
          accounts: filtered,
        };
      })
      .filter((x) => x.accounts.length > 0);
  }

  private compareByAmount = (a: AccountData, b: AccountData) => {
    return a.amount < b.amount ? 1 : -1;
  };

  private emptyPredicate = (x: AccountData) => {
    return this.hideEmpty ? x.amount !== 0 : x;
  };

  private totalAmount(accArr: AccountData[]): number {
    return accArr.reduce((a, c) => {
      const symbolCoeficent: number =
        c.symbol === 'USD'
          ? this.symbolChangeService.prices.get('MEP')?.venta ?? 0
          : 1;
      return a + c.amount * symbolCoeficent;
    }, 0);
  }
}
