import { Component, inject, Input, OnInit } from '@angular/core';
import { Account } from '../../models/accountData.model';
import { TransactionResponse } from '../../models/transaction.model';
import { PublicUserData } from '../../models/userdata.model';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transaction-list-item',
  templateUrl: './transaction-list-item.component.html',
  styleUrl: './transaction-list-item.component.scss',
})
export class TransactionListItemComponent implements OnInit {
  account: Account;
  userData: PublicUserData;
  @Input() transaction: TransactionResponse;

  private authService = inject(AuthService);
  private accountService = inject(AccountService);

  ngOnInit() {
    this._getAccount();
    if (this.authService.commonUsersData.has(this.transaction.user_id)) {
      this.userData = this.authService.commonUsersData.get(
        this.transaction.user_id
      ) as PublicUserData;
    } else {
      this.authService
        .getForeingUserData(this.transaction.user_id)
        .subscribe()
        .add(() => {
          if (this.authService.commonUsersData.has(this.transaction.user_id)) {
            this.userData = this.authService.commonUsersData.get(
              this.transaction.user_id
            ) as PublicUserData;
          }
        });
    }

    this.authService.commonUsersDataEmitter.subscribe(() => {
      if (this.authService.commonUsersData.has(this.transaction.user_id)) {
        this.userData = this.authService.commonUsersData.get(
          this.transaction.user_id
        ) as PublicUserData;
      }
    });
  }
  private _getAccount() {
    const account = this.accountService.$account
      .getValue()
      .filter((x) => x.data._id === this.transaction.account_id);
    if (account.length === 1) {
      this.account = account[0];
    }
  }

  get foreingTransaction(): boolean {
    if (this.userData && this.account?.data.user_id) {
      return this.userData.id !== this.account?.data.user_id;
    } else {
      return false;
    }
  }
}
