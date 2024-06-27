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
  TransactionFilterRequest,
  TransactionResponse,
} from 'src/app/shared/models/transaction.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { combineLatest, Observable } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { Category } from 'src/app/shared/models/category.model';
import { ScopeService } from 'src/app/shared/services/scope.service';
import { Scope } from 'src/app/shared/models/scope.model';

@Component({
  selector: 'app-account-history',
  templateUrl: './account-history.component.html',
  styleUrls: ['./account-history.component.scss'],
})
export class AccountHistoryComponent implements OnInit {
  transactions: TransactionResponse[];
  accountId: any;
  account: Account;
  searchFormGroup: FormGroup = new FormGroup({
    category: new FormControl(''),
    description: new FormControl(''),
  });

  @ViewChild(MatPaginator) paginator: MatPaginator;
  typing: boolean;
  fetching: boolean;
  scopes: Scope[] = [];
  catSelectorOpen: boolean = false;
  filter: Partial<{
    [P in keyof TransactionFilterRequest]: string;
  }> = {};

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private accService: AccountService,
    private scopeService: ScopeService,

    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    combineLatest([this.aRoute.paramMap, this.aRoute.queryParams])
      .pipe(
        map(([params, queryParams]) => {
          const id: string | null = params.get('accountId');
          const description = queryParams['description'] || null;
          const category = queryParams['category'] || null;

          if (!id) throw new Error('No accountId provided');

          return { id, description, category };
        })
      )
      .subscribe(({ id, description, category }) => {
        this.accountId = id;

        const ssp: SspPayload<TransactionResponse> = {
          paginator: {
            pageIndex: 0,
            pageSize: 5,
          },
        };

        this.searchFormGroup.get('description')?.setValue(description);
        this.filter.description = description;

        if (category) {
          const catValue = this.searchFormGroup.get('category')?.value;
          if (!catValue) {
            this.searchFormGroup
              .get('category')
              ?.setValue({ name: category, icon: 'menu' });
          }
        }
        this.filter.category = category;

        this.getAccountTransactions(ssp);

        if (!this.account) {
          this.accService
            .getById(this.accountId)
            .subscribe((x) => (this.account = x));
        }
      });

    this.searchFormGroup.valueChanges
      .pipe(
        tap((val) => (this.typing = true)),
        debounceTime(1000),
        tap((val) => (this.typing = false)),
        distinctUntilChanged(),
        tap((val) => (this.fetching = true))
      )
      .subscribe((res) => {
        this.updateQueryParam(res.description, res.category?.name);
        this.fetching = false;
      });
  }

  updateQueryParam(description?: string, category?: string) {
    if (!description || description === '') {
      description = undefined;
    }
    if (!category || category === '') {
      category = undefined;
    }
    this.router.navigate([], {
      queryParams: { description: description, category: category },
      queryParamsHandling: 'merge', // Para mantener otros parámetros de consulta intactos
    });
  }

  getAccountTransactions(ssp: SspPayload<TransactionResponse>) {
    if (!this.accountId) throw new Error('No account id provided');

    this.accService
      .getAccountTransactions(this.accountId, ssp, this.filter)
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

    const { description } = this.searchFormGroup.value;
    if (description) {
      this.searchFormGroup.get('description')?.setValue(description);
      this.filter;
      ssp.filter = {
        filterOptions: ['description'],
        filterValue: description,
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
          this.accService.getAccounts();
        }
      });
  }

  changeCategory(cat?: Category) {
    this.searchFormGroup.get('category')?.setValue(cat);
    this.catSelectorOpen = false;
  }
}
