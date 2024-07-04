import { Component, OnInit } from '@angular/core';
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
  accountBalanceDataMap: Map<string, BalanceData[]> = new Map();
  accountBalanceData: BalanceData[][];
  fetchingBalanceData: boolean = false;
  constructor(private accService: AccountService) {}

  ngOnInit(): void {
    /* this.accService.$account
      .pipe(filter((x) => x.length > 0))
      .subscribe((x) => {
        this.getAccountBalance();
      }); */
  }

  getAccountBalance() {
    const to: Date = new Date();
    const from: Date = new Date();
    from.setDate(from.getDate() - this.balanceDays + 1);

    const accId: string[] = this.accService.$account.value.map(
      (x) => x.data._id
    );
    this.fetchingBalanceData = true;

    this.accService.getWholeBalance(from, to).subscribe((res) => {
      this.accountBalanceData = [res];
    });
  }
}
