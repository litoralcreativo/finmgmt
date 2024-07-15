import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoryDialogComponent } from 'src/app/shared/components/category-dialog/category-dialog.component';
import { MonthlyAcumulator } from 'src/app/shared/models/accumulator.model';
import { Category } from 'src/app/shared/models/category.model';
import { Scope } from 'src/app/shared/models/scope.model';
import { ScopeAcumulator } from 'src/app/shared/models/scopeAcumulator.model';
import { TransactionResponse } from 'src/app/shared/models/transaction.model';
import { ScopeService } from 'src/app/shared/services/scope.service';

@Component({
  selector: 'app-scope',
  templateUrl: './scope.component.html',
  styleUrl: './scope.component.scss',
})
export class ScopeComponent {
  scopeId: string;
  scope: Scope;
  scopeCategories: Category[];
  year: number;
  month: number;
  transactions: TransactionResponse[] = [];

  fetchingScope: boolean = false;
  fetchingAcumulator: boolean = false;
  fetchingTransactions: boolean = false;

  searchFormControl: FormControl = new FormControl('');

  donutData: MonthlyAcumulator;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private scopeService: ScopeService,
    private dialog: MatDialog
  ) {
    const today: Date = new Date();
    this.donutData = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      total: 0,
      groups: [],
    };
  }

  ngOnInit(): void {
    const date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();

    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('scopeId');
      if (!id) throw new Error('No scopeId provided');

      this.scopeId = id;
      this.getScopeData();
      this.getScopeAcumulator();
      this.getScopeTransactions();
      /* this.getAccountBalance(); */
    });
  }

  getScopeData() {
    this.fetchingScope = true;
    this.scopeService
      .getById(this.scopeId)
      .subscribe((scope) => {
        this.scope = scope;
        this.scopeCategories = scope.getCategories();
      })
      .add(() => {
        this.fetchingScope = false;
      });
  }
  getScopeTransactions() {}

  getScopeAcumulator() {
    this.fetchingAcumulator = true;
    this.scopeService
      .getCategoriesAmount(this.scopeId, this.year, this.month)
      .subscribe((res) => {
        this.donutData = res;
      })
      .add(() => (this.fetchingAcumulator = false));
  }

  navigateBack() {
    this.router.navigate(['..'], {
      relativeTo: this.aRoute,
    });
  }

  onTransactionClick(transaction: TransactionResponse) {
    /* this.openTransactionDialog(
      transaction.amount > 0 ? 'in' : 'out',
      transaction
    ); */
  }

  onSearch() {
    const search = this.searchFormControl.value;
    if (search) {
      this.goToHistory(search);
    }
  }

  goToHistory(search?: string) {
    /* const queryParams = search ? { search } : {};

    this.router.navigate(['history'], {
      relativeTo: this.aRoute,
      queryParams: queryParams,
    }); */
  }

  onAddCategoryBtnClick() {
    this.dialog
      .open(CategoryDialogComponent, {
        data: {
          scope: this.scope,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getScopeData();
        }
      });
  }
}
