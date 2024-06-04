import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { routes } from 'src/environments/routes';
import { AccountData } from '../models/accountData.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getAccounts(): Observable<AccountData[]> {
    return this.http.get<AccountData[]>(routes.account.all, {
      withCredentials: true,
    });
  }

  createAccount(account: Partial<AccountData>): Observable<AccountData[]> {
    return this.http.post<AccountData[]>(routes.account.all, account, {
      withCredentials: true,
    });
  }
}
