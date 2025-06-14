import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { MonthlyAcumulator } from '../models/accumulator.model';
import { Category } from '../models/category.model';
import { Scope, ScopeDTO, ScopeResponse } from '../models/scope.model';
import { TransactionResponse } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { SspResponse } from '../models/sspdata.model';
import { generateQuery } from 'src/app/shared/utils/query.utils';

@Injectable({
  providedIn: 'root',
})
export class ScopeService {
  $scopes: BehaviorSubject<Scope[]> = new BehaviorSubject<Scope[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.userData.subscribe((data) => {
      if (data) {
        this.getScopes();
      } else {
        this.$scopes.next([]);
      }
    });
  }

  getScopes(): void {
    this.http
      .get<{ total: number; elements: ScopeResponse[] }>(routes.scopes.all, {
        withCredentials: true,
      })
      .pipe(first())
      .subscribe((res) => {
        this.$scopes.next(
          res.elements
            .map((x) => new Scope(x))
            .sort((a, b) => {
              return Number(a.data.shared) - Number(b.data.shared);
            })
        );
      });
  }

  getById(scopeId: string): Observable<Scope> {
    return this.http
      .get<ScopeResponse>(routes.scopes.byId(scopeId), {
        withCredentials: true,
      })
      .pipe(map((acc) => new Scope(acc)));
  }

  createScope(scope: ScopeDTO): Observable<any> {
    return this.http.post(routes.scopes.create, scope);
  }

  getCategoriesAmount(
    scopeId: string,
    year: number,
    month: number
  ): Observable<MonthlyAcumulator> {
    return this.http.get<MonthlyAcumulator>(
      `${routes.scopes.categoriesAmount(scopeId)}?year=${year}&month=${month}`,
      {
        withCredentials: true,
      }
    );
  }

  editCategory(
    scopeId: string,
    categoryName: string,
    category: Category
  ): Observable<any> {
    return this.http
      .patch(routes.scopes.updateCategory(scopeId, categoryName), category)
      .pipe(
        tap((res: any) => {
          if (res.result?.category?.modifiedCount) this.getScopes();
        })
      );
  }

  createCategory(scopeId: string, category: Category): Observable<any> {
    return this.http.post(routes.scopes.createCategory(scopeId), category).pipe(
      tap((res: any) => {
        this.getScopes();
      })
    );
  }

  getTransactions(
    scopeId: string,
    year: number,
    month: number,
    page: number = 1,
    pageSize: number = 5
  ): Observable<SspResponse<TransactionResponse>> {
    const query = generateQuery([
      { key: 'year', value: year.toString() },
      { key: 'month', value: month.toString() },
      { key: 'page', value: (page - 1).toString() },
      { key: 'pageSize', value: pageSize.toString() },
    ]);

    return this.http.get<SspResponse<TransactionResponse>>(
      routes.scopes.transactions(scopeId, query),
      { withCredentials: true }
    );
  }
}
