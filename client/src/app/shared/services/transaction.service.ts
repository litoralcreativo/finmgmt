import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { routes } from 'src/environments/routes';
import {
  Transaction,
  TransactionRequestDTO,
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient) {}

  createTransaction(
    transactionRequest: TransactionRequestDTO
  ): Observable<string> {
    return this.http.post<string>(
      routes.transactions.create,
      transactionRequest,
      {
        withCredentials: true,
      }
    );
  }
}
