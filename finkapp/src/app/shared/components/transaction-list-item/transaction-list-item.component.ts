import { Component, Input } from '@angular/core';
import { TransactionResponse } from '../../models/transaction.model';

@Component({
  selector: 'app-transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrl: './transaction-list-item.component.scss',
})
export class TransactionListItemComponent {
  @Input('transaction') transaction: TransactionResponse;
}
