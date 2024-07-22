import { Component, OnInit } from '@angular/core';
import {
  Account,
  AccountData,
  AccountType,
  ACCOUNT_TYPES,
} from 'src/app/shared/models/accountData.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { SymbolChangeService } from 'src/app/shared/services/symbol-change.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent extends FetchingFlag implements OnInit {
  accounts: Account[];
  sortedAccounts: { title: string; accounts: Account[]; sum: number }[];
  hideEmpty: boolean = false;
  selectedAccountTypes: AccountType[] = [...ACCOUNT_TYPES];

  constructor(
    private accService: AccountService,
    private symbolChangeService: SymbolChangeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.fetchList();
  }

  fetchList() {
    this.fetching = true;
    this.accService.$account.subscribe({
      next: (acc) => {
        this.accounts = acc;
        this.updateList();
        this.fetching = false;
      },
    });
  }

  updateList() {
    const types: string[] = [
      ...new Set(this.accounts.map((x) => x.data.type)),
    ].filter((x) => this.selectedAccountTypes.includes(x));

    this.sortedAccounts = types
      .map((type) => {
        const filtered = this.accounts
          .filter((x) => x.data.type === type)
          .sort(this.compareByAmount)
          .sort(this.compareByFavorite)
          .filter(this.emptyPredicate);

        return {
          title: type,
          sum: this.totalAmount(filtered),
          accounts: filtered,
        };
      })
      .filter((x) => x.accounts.length > 0);
  }

  private compareByFavorite = (a: Account, b: Account) => {
    if (a.data.favorite) return -1;
    return 1;
  };

  private compareByAmount = (a: Account, b: Account) => {
    return a.data.amount < b.data.amount ? 1 : -1;
  };

  private emptyPredicate = (x: Account) => {
    return this.hideEmpty ? x.data.amount !== 0 : x;
  };

  private totalAmount(accArr: Account[]): number {
    return accArr.reduce((a, c) => {
      let symbolCoeficent: number = 1;
      if (c.data.symbol === 'USD') {
        symbolCoeficent =
          this.symbolChangeService.prices.get('MEP')?.venta ?? 0;
      }
      if (c.data.symbol === 'USDT') {
        symbolCoeficent =
          this.symbolChangeService.prices.get('CRIPTO')?.venta ?? 0;
      }
      return a + c.data.amount * symbolCoeficent;
    }, 0);
  }
}
