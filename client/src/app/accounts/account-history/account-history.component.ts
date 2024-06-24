import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionDialogComponent } from 'src/app/shared/components/transaction-dialog/transaction-dialog.component';
import { Account } from 'src/app/shared/models/accountData.model';
import { SspPayload } from 'src/app/shared/models/sspdata.model';
import {
  IncomingTransaction,
  OutgoingTransaction,
  Transaction,
  TransactionResponse,
} from 'src/app/shared/models/transaction.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { combineLatest } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.scss'],
})
export class AccountHistoryComponent implements OnInit {
  transactions: TransactionResponse[];
  accountId: any;
  account: Account;
  searchFormControl: FormControl = new FormControl('');

  @ViewChild(MatPaginator) paginator: MatPaginator;
  typing: boolean;
  fetching: boolean;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private accService: AccountService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    combineLatest([this.aRoute.paramMap, this.aRoute.queryParams])
      .pipe(
        map(([params, queryParams]) => {
          const id = params.get('accountId');
          const search = queryParams['search'] || null;

          if (!id) throw new Error('No accountId provided');

          return { id, search };
        })
      )
      .subscribe(({ id, search }) => {
        this.accountId = id;

        const ssp: SspPayload<TransactionResponse> = {
          paginator: {
            pageIndex: 0,
            pageSize: 5,
          },
        };

        if (search) {
          this.searchFormControl.setValue(search);
          ssp.filter = {
            filterOptions: ['description'],
            filterValue: search,
          };
        }

        this.getAccountTransactions(ssp);

        if (!this.account) {
          this.accService
            .getById(this.accountId)
            .subscribe((x) => (this.account = x));
        }
      });

    this.searchFormControl.valueChanges
      .pipe(
        tap((val) => (this.typing = true)),
        debounceTime(1000),
        tap((val) => (this.typing = false)),
        distinctUntilChanged(),
        tap((val) => (this.fetching = true))
      )
      .subscribe((res) => {
        this.updateQueryParam(res);
        this.fetching = false;
      });
  }

  updateQueryParam(value: string) {
    this.router.navigate([], {
      queryParams: { search: value },
      queryParamsHandling: 'merge', // Para mantener otros parámetros de consulta intactos
    });
  }

  getAccountTransactions(ssp: SspPayload<TransactionResponse>) {
    if (!this.accountId) throw new Error('No account id provided');

    this.accService
      .getAccountTransactions(this.accountId, ssp)
      .subscribe((res) => {
        this.transactions = res.elements;
        this.paginator.pageIndex = res.page;
        this.paginator.pageSize = res.pageSize;
        this.paginator.length = res.total;
      });
  }

  onPaginatorChange(event: PageEvent) {
    const ssp: SspPayload<TransactionResponse> = {
      paginator: {
        pageIndex: event.pageIndex,
        pageSize: event.pageSize,
      },
    };

    const search = this.searchFormControl.value;
    if (search) {
      this.searchFormControl.setValue(search);
      ssp.filter = {
        filterOptions: ['description'],
        filterValue: search,
      };
    }
    this.getAccountTransactions(ssp);
  }

  navigateBack() {
    this.router.navigate(['..'], {
      relativeTo: this.aRoute,
    });
  }

  onTransactionClick(madeTransaction: TransactionResponse) {
    let transaction: Transaction;
    if (!this.account) throw new Error('No account provided');

    if (madeTransaction.amount > 0)
      transaction = new IncomingTransaction(this.account);
    else transaction = new OutgoingTransaction(this.account);

    if (madeTransaction) {
      transaction.madeTransaction = madeTransaction;
      transaction.setAmount(madeTransaction.amount);
      transaction.setDescription(madeTransaction.description);
      transaction.setScope(madeTransaction.scope);
    }

    this.dialog
      .open<TransactionDialogComponent>(TransactionDialogComponent, {
        data: transaction,
        width: '500px',
      })
      .afterClosed()
      .subscribe((mustUpdate) => {
        if (mustUpdate) {
          this.accService.getAccounts();
        }
      });
  }
}
