import { ChangeDetectorRef, Component } from '@angular/core';
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
  scopeCategories: (Category & {
    selected?: boolean;
    includedInGraph?: boolean;
  })[];
  year: number;
  month: number;
  transactions: TransactionResponse[] = [];

  fetchingScope: boolean = false;
  fetchingAcumulator: boolean = false;
  fetchingTransactions: boolean = false;

  searchFormControl: FormControl = new FormControl('');

  donutData: MonthlyAcumulator;

  colorTheme: string = '#3878c8';

  monthTotal: number = 0;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private scopeService: ScopeService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
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
        this.colorTheme = this.scope.data.shared ? '#64307a' : '#3878c8';
        this.updateCategories();
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
        this.updateCategories();
      })
      .add(() => (this.fetchingAcumulator = false));
  }

  onMonthlyAccumulatorNav(direction: -1 | 1) {
    const date = new Date(this.year, this.month);
    date.setMonth(this.month + direction);
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.getScopeAcumulator();
  }
  updateCategories() {
    // this.hasOutcome = true
    this.monthTotal = this.donutData.groups
      .filter((x) => x.amount < 0)
      .reduce((a, c) => a + c.amount, 0);
    this.monthTotal = Math.abs(this.monthTotal);
    this.scopeCategories?.forEach((x) => {
      x.includedInGraph = this.donutData.groups.some(
        (y) => y.category.name === x.name
      );
    });
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

  oncategorySelectedFromGraph(category: { name: string; selected: boolean }) {
    const index = this.scopeCategories.findIndex(
      (x) => x.name === category.name
    );
    this.scopeCategories.forEach((x) => {
      x.selected = false;
    });
    if (index !== -1) {
      this.scopeCategories[index].selected = category.selected;
      this.cdr.detectChanges();
    }
  }
}
