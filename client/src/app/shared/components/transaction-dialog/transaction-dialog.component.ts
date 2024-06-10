import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account, AccountData } from '../../models/accountData.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { AccountService } from '../../services/account.service';
import { FetchingFlag } from '../../utils/fetching-flag';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { Scope } from '../../models/scope.model';
import { ScopeService } from '../../services/scope.service';
import { Category } from '../../models/category.model';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent extends FetchingFlag implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  form: FormGroup;
  userAccounts: Account[] = [];
  userScopes: Scope[] = [];
  type?: TransactionType;
  categories: Category[] = [];

  @ViewChild('categoriesInput') categoriesInput: ElementRef<HTMLInputElement>;
  defaultCategory: Category[];

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    private accService: AccountService,
    private scopeService: ScopeService,
    private tranService: TransactionService,
    @Inject(MAT_DIALOG_DATA) public data: Transaction
  ) {
    super();
  }

  ngOnInit(): void {
    this.type = this.data.type;

    this.form = new FormGroup({
      amount: new FormControl(null, [Validators.required]),
      description: new FormControl(''),
      date: new FormControl(new Date(), []),
      origin: new FormControl(this.data.origin ?? null),
      destination: new FormControl(this.data.destination ?? null),
      scope: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required]),
    });
    this.form.get('date')?.disable();
    this.form.get('category')?.disable();

    this.fetchLists();

    this.form.get('scope')?.valueChanges.subscribe((scope: Scope) => {
      if (scope) {
        this.form.get('category')?.enable();
        this.categories = scope.getCategories();
      } else {
        this.form.get('category')?.reset();
        this.form.get('category')?.disable();
      }
    });
  }

  fetchLists() {
    this.fetching = true;

    const $accounts: Observable<Account[]> = this.accService.$account;
    const $scopes: Observable<Scope[]> = this.scopeService.$scopes;

    combineLatest([$accounts, $scopes]).subscribe({
      next: ([accounts, scopes]) => {
        this.userAccounts = accounts;
        this.userScopes = scopes;
        this.setDefaultScopeAndCat();
        this.fetching = false;
      },
    });
  }

  setDefaultScopeAndCat() {
    const firstPrivateScope = this.userScopes.find((x) => !x.data.shared);
    this.form.get('scope')?.setValue(firstPrivateScope);
    if (firstPrivateScope) {
      this.form.get('category')?.enable();
      this.categories = firstPrivateScope.getCategories();
      this.form
        .get('category')
        ?.setValue(firstPrivateScope.getDefaultCategory());
    }
  }

  commit() {
    const { amount, description, date, scope, category } =
      this.form.getRawValue();
    this.data.setAmount(amount);
    this.data.setDescription(description);
    this.data.setDate(date);
    this.data.setScope(scope);
    this.data.setCategory(category);
    const request = this.data.generateRequest();

    this.fetching = true;
    this.tranService
      .createTransaction(request)
      .subscribe({
        next: (x) => {
          this.dialogRef.close(true);
        },
        error: (err) => {
          const a = err;
        },
      })
      .add(() => {
        this.fetching = true;
      });
  }
}
