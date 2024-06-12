import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { SspPayload } from 'src/app/shared/models/sspdata.model';
import {
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

  onPaginatorChante(event: PageEvent) {
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
}
