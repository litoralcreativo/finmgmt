import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { AccountAcumulator } from '../models/accountAcumulator.model';
import { Account, AccountData } from '../models/accountData.model';
import { BalanceData, BalanceDataDTO } from '../models/balanceData.model';
import { SspPayload, SspResponse } from '../models/sspdata.model';
import {
  TransactionFilterRequest,
  TransactionResponse,
} from '../models/transaction.model';

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
        const accounts: Account[] = res.map((x) => new Account(x));
        accounts.sort((a, b) => (a.data.type > b.data.type ? -1 : 1));
        this.$account.next(accounts);
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
    accountId: string,
    ssp?: SspPayload<TransactionResponse>,
    filter?: Partial<{
      [P in keyof TransactionFilterRequest]: string;
    }>
  ): Observable<SspResponse<TransactionResponse>> {
    let kv: { key: string; value: string }[] = [];
    if (ssp) {
      kv.push(...generateSspKV(ssp));
    }
    if (filter) {
      kv.push(...generateFilterKV(filter));
    }

    return this.http.get<SspResponse<TransactionResponse>>(
      routes.account.transactions(accountId, generateQuery(kv)),
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

  getCategoriesAmount(
    accountId: string,
    year: number,
    month: number
  ): Observable<AccountAcumulator> {
    return this.http.get<AccountAcumulator>(
      `${routes.account.categoriesAmount(
        accountId
      )}?year=${year}&month=${month}`,
      {
        withCredentials: true,
      }
    );
  }

  getAccountBalance(
    accountId: string,
    from: Date,
    to: Date
  ): Observable<BalanceData[]> {
    return this.http
      .get<BalanceDataDTO[]>(`${routes.account.balance(accountId, from, to)}`)
      .pipe(
        map((res) => {
          return res.map((x) => ({
            day: new Date(x.day),
            totalAmount: Number(x.totalAmount.toFixed(2)),
          }));
        })
      );
  }

  getWholeBalance(from: Date, to: Date): Observable<BalanceData[]> {
    return this.http
      .get<BalanceDataDTO[]>(`${routes.account.wholeBalance(from, to)}`)
      .pipe(
        map((res) => {
          return res.map((x) => ({
            day: new Date(x.day),
            totalAmount: Number(x.totalAmount.toFixed(2)),
          }));
        })
      );
  }
}

function generateSspKV(
  ssp: SspPayload<TransactionResponse>
): { key: string; value: string }[] {
  let result: { key: string; value: string }[] = [];
  result.push({ key: 'page', value: ssp.paginator.pageIndex.toString() });
  result.push({ key: 'pageSize', value: ssp.paginator.pageSize.toString() });
  return result;
}

function generateFilterKV<T>(
  filter: Partial<{
    [P in keyof T]: string;
  }>
): { key: string; value: string }[] {
  let result: { key: string; value: string }[] = [];
  Object.entries<any>(filter).forEach(([key, value]) => {
    if (value) result.push({ key: key, value: value ?? '' });
  });
  return result;
}

function generateQuery(
  kv: { key: string; value: string }[]
): string | undefined {
  if (kv.length === 0) return undefined;
  return kv.map((x) => `${x.key}=${x.value}`).join('&');
}
