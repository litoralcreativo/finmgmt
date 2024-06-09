import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { Account, AccountData } from '../models/accountData.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  $account: BehaviorSubject<Account[]> = new BehaviorSubject<Account[]>([]);

  constructor(private http: HttpClient) {
    this.getAccounts();
  }

  getAccounts() {
    this.http
      .get<AccountData[]>(routes.account.all, {
        withCredentials: true,
      })
      .pipe(first())
      .subscribe((res) => {
        this.$account.next(res.map((x) => new Account(x)));
      });

    /* return this.http
      .get<AccountData[]>(routes.account.all, {
        withCredentials: true,
      })
      .pipe(map((accs) => accs.map((acc) => new Account(acc)))); */
  }

  createAccount(account: Partial<AccountData>): Observable<any> {
    return this.http.post<AccountData[]>(routes.account.all, account, {
      withCredentials: true,
    });
  }

  getById(id: string): Observable<Account> {
    return this.http
      .get<AccountData>(routes.account.byId(id), {
        withCredentials: true,
      })
      .pipe(map((acc) => new Account(acc)));
  }

  toogleFavorite(accountId: string, state: boolean): Observable<boolean> {
    return this.http.patch<boolean>(
      routes.account.setFavorite(accountId),
      {
        favorite: state,
      },
      {
        withCredentials: true,
      }
    );
  }
}
