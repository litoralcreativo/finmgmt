import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionDialogComponent } from 'src/app/shared/components/transaction-dialog/transaction-dialog.component';
import { SspPayload } from 'src/app/shared/models/sspdata.model';
import {
  TransactionResponse,
  TransactionFilterRequest,
} from 'src/app/shared/models/transaction.model';
import { ScopeService } from 'src/app/shared/services/scope.service';
import { Scope } from 'src/app/shared/models/scope.model';
import { FormControl, FormGroup } from '@angular/forms';
import { Category } from 'src/app/shared/models/category.model';
import { debounceTime, distinctUntilChanged, tap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { PublicUserData } from 'src/app/shared/models/userdata.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-scope-history',
  templateUrl: './scope-history.component.html',
  styleUrls: ['./scope-history.component.scss'],
})
export class ScopeHistoryComponent implements OnInit {
  transactions: TransactionResponse[] = [];
  scopeId: string;
  scope: Scope;
  year: number;
  month: number;
  searchFormGroup: FormGroup = new FormGroup({
    category: new FormControl(''),
    description: new FormControl(''),
    user_id: new FormControl(''),
  });
  users: PublicUserData[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  filtering = false;
  fetching = false;
  catSelectorOpen = false;
  filter: Partial<{
    [P in keyof TransactionFilterRequest]: string;
  }> = {};
  ssp: SspPayload<TransactionResponse>;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    private scopeService: ScopeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    combineLatest([this.aRoute.paramMap, this.aRoute.queryParams])
      .pipe(
        map(([params, queryParams]) => {
          const id: string | null = params.get('scopeId');
          const description = queryParams['description'] || null;
          const category = queryParams['category'] || null;
          const year = queryParams['year']
            ? +queryParams['year']
            : new Date().getFullYear();
          const month = queryParams['month']
            ? +queryParams['month']
            : new Date().getMonth() + 1;

          if (!id) throw new Error('No scopeId provided');

          return { id, description, category, year, month };
        })
      )
      .subscribe(({ id, description, category, year, month }) => {
        this.scopeId = id;
        this.year = year;
        this.month = month;

        const ssp: SspPayload<TransactionResponse> = {
          paginator: {
            pageIndex: 0,
            pageSize: 5,
          },
        };

        this.ssp = ssp;

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

        this.getScopeTransactions();

        if (!this.scope) {
          this.scopeService.getById(this.scopeId).subscribe((x) => {
            this.scope = x;
            // Poblar usuarios del scope si existen
            if (x.data.users) {
              this.users = [];
              x.data.users.forEach((userId: string) => {
                let user = this.authService.commonUsersData.get(userId);
                if (user) {
                  this.users.push(user as PublicUserData);
                } else {
                  this.authService.getForeignUserData(userId).subscribe(() => {
                    const loadedUser =
                      this.authService.commonUsersData.get(userId);
                    if (loadedUser) {
                      this.users = [
                        ...this.users,
                        loadedUser as PublicUserData,
                      ];
                      this.cdr.detectChanges();
                    }
                  });
                }
              });
            }
          });
        }
      });

    this.searchFormGroup.valueChanges
      .pipe(
        tap(() => (this.filtering = true)),
        debounceTime(1000),
        tap(() => (this.filtering = false)),
        distinctUntilChanged((a, b) => {
          return (
            a.description === b.description &&
            a.category?.name === b.category?.name &&
            a.user_id === b.user_id
          );
        })
      )
      .subscribe((res) => {
        this.updateQueryParam(res.description, res.category?.name, res.user_id);
      });
  }

  updateQueryParam(description?: string, category?: string, user_id?: string) {
    if (!description || description === '') {
      description = undefined;
    }
    if (!category || category === '') {
      category = undefined;
    }
    if (!user_id || user_id === '') {
      user_id = undefined;
    }
    this.router.navigate([], {
      queryParams: {
        description: description,
        category: category,
        user_id: user_id,
      },
      queryParamsHandling: 'merge',
    });
  }

  getScopeTransactions() {
    if (!this.scopeId) throw new Error('No scope id provided');

    this.fetching = true;
    this.searchFormGroup.controls['description'].disable({ emitEvent: false });
    // Agregar year, month y user_id al filtro, como string
    const filterWithDate = {
      ...this.filter,
      year: this.year?.toString(),
      month: this.month?.toString(),
      user_id: this.searchFormGroup.get('user_id')?.value || undefined,
    };
    console.log(filterWithDate);

    this.scopeService
      .getScopeTransactions(this.scopeId, this.ssp, filterWithDate)
      .subscribe((res) => {
        this.fetching = false;
        this.searchFormGroup.controls['description'].enable({
          emitEvent: false,
        });
        this.transactions = res.elements;
        this.cdr.detectChanges();
        if (this.paginator) {
          this.paginator.pageIndex = res.page;
          this.paginator.pageSize = res.pageSize;
          this.paginator.length = res.total;
        }
      });
  }

  onPaginatorChange(event: PageEvent) {
    const ssp: SspPayload<TransactionResponse> = {
      paginator: {
        pageIndex: event.pageIndex,
        pageSize: event.pageSize,
      },
    };
    this.ssp = ssp;
    this.getScopeTransactions();
  }

  navigateBack() {
    this.router.navigate(['..'], {
      relativeTo: this.aRoute,
    });
  }

  onTransactionClick(transaction: TransactionResponse) {
    this.dialog
      .open(TransactionDialogComponent, {
        data: transaction,
        width: '500px',
      })
      .afterClosed()
      .subscribe((mustUpdate) => {
        if (mustUpdate) {
          const year = new Date().getFullYear();
          const month = new Date().getMonth() + 1;
          this.getScopeTransactions();
        }
      });
  }

  changeCategory(cat?: Category) {
    this.searchFormGroup.get('category')?.setValue(cat);
    this.catSelectorOpen = false;
  }
}
