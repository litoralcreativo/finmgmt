import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, AccountData } from 'src/app/shared/models/accountData.model';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
})
export class AccountCardComponent implements OnInit {
  @Input('account') account: Account;
  @Input('ripple') ripple: boolean = true;
  @Output('fabClick') fabClick: EventEmitter<boolean> = new EventEmitter();

  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  goToAccount() {
    this.router.navigate([this.account.data._id], { relativeTo: this.aRoute });
  }

  toogleFavorite() {
    this.fabClick.emit(true);
  }
}
