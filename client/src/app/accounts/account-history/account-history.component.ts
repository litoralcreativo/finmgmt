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

@Component({
  selector: 'app-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.scss'],
})
export class AccountHistoryComponent implements OnInit {
  transactions: TransactionResponse[];
  accountId: any;
  account: Account;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private accService: AccountService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('accountId');
      if (!id) throw new Error('No accountId provided');

      this.accountId = id;
      const ssp: SspPayload<TransactionResponse> = {
        paginator: {
          pageIndex: 0,
          pageSize: 5,
        },
      };
      this.getAccountTransactions(ssp);
      this.accService
        .getById(this.accountId)
        .subscribe((x) => (this.account = x));
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
