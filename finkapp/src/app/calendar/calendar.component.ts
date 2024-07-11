import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { Account, AccountType } from '../shared/models/accountData.model';
import { Scope } from '../shared/models/scope.model';
import { AccountService } from '../shared/services/account.service';
import { CalendarService } from '../shared/services/calendar.service';
import { ScopeService } from '../shared/services/scope.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  filter: FormGroup = new FormGroup({
    account: new FormControl([]),
  });

  userAccounts: Account[] = [];
  groupedAccounts: { type: AccountType; accounts: Account[] }[] = [];
  fetching: boolean;

  today: Date = new Date();
  selectedDay: Date | null = null;

  constructor(
    private calendarService: CalendarService,
    private accService: AccountService,
    private scopeService: ScopeService
  ) {}

  ngOnInit(): void {
    this.fetchLists();
  }

  fetchLists() {
    this.fetching = true;

    const $accounts: Observable<Account[]> = this.accService.$account;
    const $scopes: Observable<Scope[]> = this.scopeService.$scopes;

    combineLatest([$accounts, $scopes]).subscribe({
      next: ([accounts, scopes]) => {
        const groups: Set<AccountType> = new Set(
          accounts.map((x) => x.data.type)
        );

        const groupedAccounts: { type: AccountType; accounts: Account[] }[] = [
          ...groups,
        ].map((group) => {
          return {
            type: group,
            accounts: accounts.filter((x) => x.data.type === group),
          };
        });
        this.userAccounts = accounts;
        this.groupedAccounts = groupedAccounts;
        if (this.userAccounts.length > 0) {
          this.filter.controls['account'].setValue(accounts);
        }
        this.fetching = false;
      },
    });
  }

  onDaySelection($event: Date | null) {}

  dateClass(date: Date, view: 'month' | 'year' | 'multi-year'): Set<string> {
    const classes: Set<string> = new Set(['all-calendar-days']);
    return classes;
  }
}
