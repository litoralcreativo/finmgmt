import { Component, OnInit } from '@angular/core';
import {
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
  accounts: AccountData[];
  sortedAccounts: { title: string; accounts: AccountData[]; sum: number }[];
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
    this.accService
      .getAccounts()
      .subscribe({
        next: (acc) => {
          this.accounts = acc;
          this.updateList();
        },
      })
      .add(() => (this.fetching = false));
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
