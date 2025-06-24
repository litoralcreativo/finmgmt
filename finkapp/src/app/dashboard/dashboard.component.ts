import { Component, inject, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BalanceData } from '../shared/models/balanceData.model';
import { AccountService } from '../shared/services/account.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  balanceDays = 30;
  accountBalanceDataMap = new Map<string, BalanceData[]>();
  accountBalanceData: BalanceData[][] = [];
  fetchingBalanceData = false;
  private accService = inject(AccountService);

  ngOnInit() {
    this.accService.$account
      .pipe(filter((x) => x.length > 0))
      .subscribe((x) => {
        this.getAccountBalance();
      });
  }

  getAccountBalance() {
    const to: Date = new Date();
    const from: Date = new Date();
    from.setDate(from.getDate() - this.balanceDays + 1);

    const accId: string[] = this.accService.$account.value.map(
      (x) => x.data._id
    );
    this.fetchingBalanceData = true;
  }
}
