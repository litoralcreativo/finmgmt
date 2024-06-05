import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TransactionDialogComponent } from 'src/app/shared/components/transaction-dialog/transaction-dialog.component';
import { Account, AccountData } from 'src/app/shared/models/accountData.model';
import { Movement } from 'src/app/shared/models/movement.model';
import { Transaction } from 'src/app/shared/models/transaction.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent extends FetchingFlag implements OnInit {
  accountId: string;
  account: Account;
  movimientos: ({ type: string } & Movement)[];

  constructor(
    private aRoute: ActivatedRoute,
    private accService: AccountService,
    private dialog: MatDialog
  ) {
    super();
    this.movimientos = [
      {
        description: 'Cadete',
        type: 'Outgoing transfer',
        date: new Date(),
        amount: -2700,
      },
      {
        description: 'Vianda',
        type: 'Outgoing transfer',
        date: new Date(),
        amount: -32400,
      },
      {
        description: 'Rendimientos del día',
        type: 'Profits',
        date: new Date(),
        amount: 24.49,
      },
      {
        description: 'Jornalero',
        type: 'Outgoing transfer',
        date: new Date(),
        amount: -40000,
      },
      {
        description: 'Devolucion elo',
        type: 'Outgoing transfer',
        date: new Date(),
        amount: -30000,
      },
      {
        description: 'Prestamo lari',
        type: 'Incoming transfer',
        date: new Date(),
        amount: 163510.08,
      },
      {
        description: 'Rendimientos del día',
        type: 'Profits',
        date: new Date(),
        amount: 122.01,
      },
      {
        description: 'Devolucion picada con agus',
        type: 'Incoming transfer',
        date: new Date(),
        amount: 4000,
      },
      {
        description: 'Panadería',
        type: 'QR Payment',
        date: new Date(),
        amount: -3300,
      },
      {
        description: 'Saldo previo',
        type: 'other',
        date: new Date(),
        amount: 27500.67,
      },
    ];
  }

  ngOnInit(): void {
    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('accountId');
      if (!id) throw new Error('No accountId provided');

      this.accountId = id;
      this.accService.getById(this.accountId).subscribe((acc) => {
        this.account = acc;
      });
    });
  }

  toogleFavorite() {
    this.accService
      .toogleFavorite(this.accountId, !this.account.data.favorite)
      .subscribe((acc) => {
        const state = this.account.data.favorite;
        this.account.favorite(!state);
      });
  }

  openTransactionDialog(type: 'in' | 'out') {
    const transaction: Transaction = new Transaction();
    switch (type) {
      case 'in':
        transaction.setDestination(this.account);
        break;
      case 'in':
        break;
    }
    this.dialog.open<TransactionDialogComponent>(TransactionDialogComponent, {
      data: transaction,
    });
  }
}
