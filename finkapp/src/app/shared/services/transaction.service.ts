import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { routes } from 'src/environments/routes';
import {
  ModifiedTransactionRequestDTO,
  TransactionRequestDTO,
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);

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

  updateTransaction(
    transactionId: string,
    modifiedTransaction: ModifiedTransactionRequestDTO
  ): Observable<undefined> {
    return this.http.patch<undefined>(
      routes.transactions.update(transactionId),
      modifiedTransaction,
      {
        withCredentials: true,
      }
    );
  }

  deleteTransaction(transactionId: string): Observable<undefined> {
    return this.http.delete<undefined>(routes.transactions.delete(transactionId));
  }
}
