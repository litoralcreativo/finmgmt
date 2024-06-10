import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { Account, AccountData } from '../models/accountData.model';
import { SspResponse } from '../models/sspdata.model';
import { TransactionResponse } from '../models/transaction.model';

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

  getAccountTransactions(
    accountId: string
  ): Observable<SspResponse<TransactionResponse>> {
    return this.http.get<SspResponse<TransactionResponse>>(
      routes.account.transactions(accountId),
      { withCredentials: true }
    );
  }

  getAccountAmount(accountId: string): Observable<number> {
    return this.http
      .get<{ totalAmount: number }>(routes.account.amount(accountId), {
        withCredentials: true,
      })
      .pipe(map((x) => x.totalAmount));
  }
}
