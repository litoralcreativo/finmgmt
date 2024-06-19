import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CategoryDetailComponent } from 'src/app/shared/components/category-detail/category-detail.component';
import { AccountAcumulator } from 'src/app/shared/models/accountAcumulator.model';
import { Category } from 'src/app/shared/models/category.model';
import { Scope } from 'src/app/shared/models/scope.model';
import { ScopeAcumulator } from 'src/app/shared/models/scopeAcumulator.model';
import { ScopeService } from 'src/app/shared/services/scope.service';

@Component({
  selector: 'app-scope',
  templateUrl: './scope.component.html',
  styleUrls: ['./scope.component.scss'],
})
export class ScopeComponent implements OnInit {
  scopeId: string;
  scope: Scope;
  scopeCategories: Category[];
  fixed: Category[] = [];
  variable: Category[] = [];
  acumulator: ScopeAcumulator;
  year: number;
  month: number;
  canGoFoward: boolean = false;

  constructor(
    private aRoute: ActivatedRoute,
    private scopeService: ScopeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const date = new Date();
    this.year = date.getFullYear();
    this.month = date.getMonth();

    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('scopeId');
      if (!id) throw new Error('No accountId provided');

      this.scopeId = id;
      this.getScope();
      this.getAcumulator();
    });
  }

  getScope() {
    this.scopeService.getById(this.scopeId).subscribe((scope) => {
      this.scope = scope;
      this.scopeCategories = scope.getCategories();
      this.fixed = this.scopeCategories.filter((x) => x.fixed);
      this.variable = this.scopeCategories.filter((x) => !x.fixed);
    });
  }

  getAcumulator() {
    this.scopeService
      .getCategoriesAmount(this.scopeId, this.year, this.month)
      .subscribe((res) => {
        this.acumulator = res;
      });
  }

  goToMonth(direction: -1 | 1) {
    const date: Date = new Date(this.year, this.month + direction);
    this.year = date.getFullYear();
    this.month = date.getMonth();

    this.getAcumulator();
  }

  editCategory(category: Category) {
    this.dialog
      .open(CategoryDetailComponent, {
        disableClose: true,
        width: '450px',
        data: {
          scope: this.scope,
          category: category,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getScope();
        }
      });
  }

  addCategory(fixed: boolean) {
    this.dialog
      .open(CategoryDetailComponent, {
        disableClose: true,
        width: '400px',
        data: {
          scope: this.scope,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.getScope();
        }
      });
  }
}
