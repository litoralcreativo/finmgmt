import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionDialogComponent } from 'src/app/shared/components/transaction-dialog/transaction-dialog.component';
import { AccountAcumulator } from 'src/app/shared/models/accountAcumulator.model';
import {
  Account,
  AccountData,
  AccountType,
} from 'src/app/shared/models/accountData.model';
import { BalanceData } from 'src/app/shared/models/balanceData.model';
import { Scope } from 'src/app/shared/models/scope.model';
import {
  IncomingTransaction,
  OutgoingTransaction,
  Transaction,
  TransactionResponse,
} from 'src/app/shared/models/transaction.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  accountId: string;
  account: Account;
  transactions: TransactionResponse[];
  acumulator: AccountAcumulator;
  year: number;
  month: number;

  fetchingAccount: boolean = false;
  fetchingAcumulator: boolean = false;
  fetchingTransactions: boolean = false;
  fetchingBalanceData: boolean = false;

  searchFormControl: FormControl = new FormControl('');

  accountBalanceData: BalanceData[][];

  balanceDays = 30;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private accService: AccountService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();

    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('accountId');
      if (!id) throw new Error('No accountId provided');

      this.accountId = id;
      this.getAccountData();
      this.getAccountTransactions();
      this.getAcumulator();
      this.getAccountBalance();
    });
  }

  getAccountBalance() {
    if (!this.accountId) throw new Error('No account id provided');

    const to: Date = new Date();
    const from: Date = new Date();
    from.setDate(from.getDate() - this.balanceDays + 1);

    this.fetchingBalanceData = true;
    this.accService
      .getAccountBalance(this.accountId, from, to)
      .subscribe((res) => {
        this.accountBalanceData = [res];
      })
      .add(() => (this.fetchingBalanceData = false));
  }

  getAcumulator() {
    this.fetchingAcumulator = true;
    this.accService
      .getCategoriesAmount(this.accountId, this.year, this.month)
      .subscribe((res) => {
        this.acumulator = res;
      })
      .add(() => (this.fetchingAcumulator = false));
  }

  getAccountData() {
    if (!this.accountId) throw new Error('No account id provided');

    this.fetchingAccount = true;
    this.accService
      .getById(this.accountId)
      .subscribe((acc) => {
        this.account = acc;
      })
      .add(() => (this.fetchingAccount = false));
  }

  getAccountTransactions() {
    if (!this.accountId) throw new Error('No account id provided');

    this.fetchingTransactions = true;
    this.accService
      .getAccountTransactions(this.accountId, {
        paginator: { pageIndex: 0, pageSize: 5 },
      })
      .subscribe((res) => {
        this.transactions = res.elements;
      })
      .add(() => (this.fetchingTransactions = false));
  }

  toogleFavorite() {
    this.accService
      .toogleFavorite(this.accountId, !this.account.data.favorite)
      .subscribe((acc) => {
        const state = this.account.data.favorite;
        this.account.favorite(!state);
      });
  }

  openTransactionDialog(
    type: 'in' | 'out' | 'swap',
    madeTransaction?: TransactionResponse
  ) {
    let transaction: Transaction;
    switch (type) {
      case 'in':
        transaction = new IncomingTransaction(this.account);
        break;
      case 'out':
        transaction = new OutgoingTransaction(this.account);
        break;
      case 'swap':
        transaction = new OutgoingTransaction(this.account);
        break;
    }

    if (madeTransaction) {
      transaction.madeTransaction = madeTransaction;
      transaction.setAmount(madeTransaction.amount);
      transaction.setDescription(madeTransaction.description);
      transaction.setScope(madeTransaction.scope);
      transaction.setDate(new Date(madeTransaction.date));
    }

    this.dialog
      .open<TransactionDialogComponent>(TransactionDialogComponent, {
        data: transaction,
        width: '500px',
      })
      .afterClosed()
      .subscribe((mustUpdate) => {
        if (mustUpdate) {
          this.getAccountData();
          this.getAcumulator();
          this.getAccountTransactions();
          this.getAccountBalance();
          this.accService.getAccounts();
        }
      });
  }

  goToHistory(search?: string) {
    const queryParams = search ? { search } : {};

    this.router.navigate(['history'], {
      relativeTo: this.aRoute,
      queryParams: queryParams,
    });
  }

  navigateBack() {
    this.router.navigate(['..'], {
      relativeTo: this.aRoute,
    });
  }

  goToMonth(direction: -1 | 1) {
    const date: Date = new Date(this.year, this.month + direction);
    this.year = date.getFullYear();
    this.month = date.getMonth();

    this.getAcumulator();
  }

  onTransactionClick(transaction: TransactionResponse) {
    this.openTransactionDialog(
      transaction.amount > 0 ? 'in' : 'out',
      transaction
    );
  }

  onSearch() {
    const search = this.searchFormControl.value;
    if (search) {
      this.goToHistory(search);
    }
  }
}
