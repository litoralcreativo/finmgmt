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
import { Observable } from 'rxjs';
import { Scope } from '../../models/scope.model';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent extends FetchingFlag implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  form: FormGroup;
  userAccounts: Account[];
  type: TransactionType;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredCategories: Observable<string[]>;
  categories: string[] = [];
  allCategories: string[] = [];

  @ViewChild('categoriesInput') categoriesInput: ElementRef<HTMLInputElement>;

  scopes: Scope[] = [];

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    private accService: AccountService,
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
    this.form.controls.date.disable();
    this.fetchLists();
  }

  fetchLists() {
    this.fetching = true;
    this.accService
      .getAccounts()
      .subscribe({
        next: (acc) => {
          if (this.data.origin) this.userAccounts = acc;
        },
      })
      .add(() => (this.fetching = false));
  }

  commit() {
    const { amount, description } = this.form.value;
    this.data.setAmount(amount);
    this.data.setDescription(description);
  }
}
