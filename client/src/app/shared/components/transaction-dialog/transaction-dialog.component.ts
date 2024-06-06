import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account, AccountData } from '../../models/accountData.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { AccountService } from '../../services/account.service';
import { FetchingFlag } from '../../utils/fetching-flag';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
      origin: new FormControl(this.data.origin ?? null),
      destination: new FormControl(this.data.destination ?? null),
      categories: new FormControl([]),
    });
    this.fetchList();
    this.updateFilteredCategories();
  }

  updateFilteredCategories() {
    this.filteredCategories = this.form.controls.categories.valueChanges.pipe(
      startWith(null),
      map((category: string | null) =>
        category
          ? this._filter(category)
          : this.allCategories
              .filter((x) => !this.categories.includes(x))
              .slice()
      )
    );
  }

  fetchList() {
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

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.categories.push(value);
    }
    event.chipInput!.clear();
    this.form.controls.categories.setValue(null);
  }

  remove(category: string): void {
    const index = this.categories.indexOf(category);

    if (index >= 0) {
      this.categories.splice(index, 1);
    }

    this.form.controls.categories.setValue('');
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.categories.push(event.option.viewValue);
    this.categoriesInput.nativeElement.value = '';
    this.form.controls.categories.setValue(null);
  }

  private _filter(value: string): string[] {
    const categoryValue = value.toLowerCase();

    return this.allCategories.filter(
      (category) =>
        !this.categories.includes(category) &&
        category.toLowerCase().includes(categoryValue)
    );
  }

  commit() {
    const { amount, description } = this.form.value;
    this.data.setAmount(amount);
    this.data.setDescription(description);
  }
}
