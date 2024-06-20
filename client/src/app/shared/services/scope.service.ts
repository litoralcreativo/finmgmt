import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { Category } from '../models/category.model';
import { Scope, ScopeDTO, ScopeResponse } from '../models/scope.model';
import { ScopeAcumulator } from '../models/scopeAcumulator.model';

@Injectable({
  providedIn: 'root',
})
export class ScopeService {
  $scopes: BehaviorSubject<Scope[]> = new BehaviorSubject<Scope[]>([]);

  constructor(private http: HttpClient) {
    this.getScopes();
  }

  getScopes() {
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
  ): Observable<ScopeAcumulator> {
    return this.http.get<ScopeAcumulator>(
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
    return this.http.patch(
      routes.scopes.updateCategory(scopeId, categoryName),
      category
    );
  }

  createCategory(scopeId: string, category: Category): Observable<any> {
    return this.http.post(routes.scopes.createCategory(scopeId), category);
  }
}
