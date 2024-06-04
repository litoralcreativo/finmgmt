import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountData } from 'src/app/shared/models/accountData.model';
import { Movement } from 'src/app/shared/models/movement.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent extends FetchingFlag implements OnInit {
  accountId: string;
  account: AccountData;
  movimientos: ({ type: string } & Movement)[];

  constructor(
    private aRoute: ActivatedRoute,
    private accService: AccountService
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
      .toogleFavorite(this.accountId, !this.account.favorite)
      .subscribe((acc) => {
        this.account.favorite = !this.account.favorite;
      });
  }
}
