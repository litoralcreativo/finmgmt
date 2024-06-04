import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountData } from 'src/app/shared/models/accountData.model';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
})
export class AccountCardComponent implements OnInit {
  @Input('account') account: AccountData;

  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  goToAccount() {
    this.router.navigate([this.account._id], { relativeTo: this.aRoute });
  }
}
