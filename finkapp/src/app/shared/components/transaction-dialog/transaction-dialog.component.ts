import {
  Component,
  ElementRef,
  inject,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Account, AccountType } from '../../models/accountData.model';
import {
  Transaction,
  TransactionType,
  IncomingTransaction,
  OutgoingTransaction,
} from '../../models/transaction.model';
import { AccountService } from '../../services/account.service';
import { FetchingFlag } from '../../utils/fetching-flag';
import { combineLatest, Observable } from 'rxjs';
import { Scope, ScopedCategory } from '../../models/scope.model';
import { ScopeService } from '../../services/scope.service';
import { Category } from '../../models/category.model';
import { TransactionService } from '../../services/transaction.service';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { AuthService } from '../../services/auth.service';
import { PublicUserData } from '../../models/userdata.model';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent extends FetchingFlag implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  maxDate: Date = new Date();

  form: FormGroup;
  userAccounts: { type: AccountType; accounts: Account[] }[] = [];
  userScopes: Scope[] = [];
  type?: TransactionType;
  categories: Category[] = [];

  swap = false;

  @ViewChild('categoriesInput') categoriesInput: ElementRef<HTMLInputElement>;
  defaultCategory: Category[];
  userData: PublicUserData;
  canEdit = true;

  private accService = inject(AccountService);
  private scopeService = inject(ScopeService);
  private tranService = inject(TransactionService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Transaction,
    public dialogRef: MatDialogRef<TransactionDialogComponent>
  ) {
    super();
  }

  ngOnInit(): void {
    this.type = this.data.type;

    this.form = new FormGroup({
      amount: new FormControl(this.data.amount, [Validators.required]),
      description: new FormControl(this.data.description),
      date: new FormControl(this.data.date ?? this.maxDate, []),
      origin: new FormControl(this.data.origin ?? null, [Validators.required]),
      destination: new FormControl(this.data.destination ?? null, [
        Validators.required,
      ]),
      scope: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required]),
    });
    this.form.get('date')?.disable();
    this.form.get('category')?.disable();

    this.form.get('amount')?.valueChanges.subscribe((value) => {
      console.log(value, this.form.get('amount'));
    });

    this.form.get('scope')?.valueChanges.subscribe((scope: Scope) => {
      if (scope) {
        this.form.get('category')?.enable();
        this.categories = scope.getCategories();
      } else {
        this.form.get('category')?.reset();
        this.form.get('category')?.disable();
      }
    });

    // --- Lógica para swap: sincronizar cuentas ---
    this.form.get('origin')?.valueChanges.subscribe((origin) => {
      if (
        this.swap &&
        this.type === 'outgoing' &&
        origin &&
        !this.form.get('destination')?.value
      ) {
        // Si es outgoing y se selecciona origin, setear destination si está vacío
        this.form.get('destination')?.setValue(this.data.destination ?? null);
      }
    });
    this.form.get('destination')?.valueChanges.subscribe((destination) => {
      if (
        this.swap &&
        this.type === 'incoming' &&
        destination &&
        !this.form.get('origin')?.value
      ) {
        // Si es incoming y se selecciona destination, setear origin si está vacío
        this.form.get('origin')?.setValue(this.data.origin ?? null);
      }
      // Si es swap y outgoing, y se selecciona destination, setear origin si está vacío
      if (
        this.swap &&
        this.type === 'outgoing' &&
        destination &&
        !this.form.get('origin')?.value
      ) {
        this.form.get('origin')?.setValue(this.data.origin ?? null);
      }
    });
    // --- Fin lógica swap ---

    this.fetchLists();
    this.onSwapCheckboxChange();
    this._checkUserData();
  }

  private _checkUserData() {
    if (!this.data.madeTransaction) return;

    const hasUserCached = this.authService.commonUsersData.has(
      this.data.madeTransaction.user_id
    );

    if (hasUserCached) {
      this.userData = this.authService.commonUsersData.get(
        this.data.madeTransaction.user_id
      ) as PublicUserData;
      this._checkIfUserCanEdit();
    } else {
      this.authService
        .getForeignUserData(this.data.madeTransaction.user_id)
        .subscribe()
        .add(() => {
          const hasUserCached = this.authService.commonUsersData.has(
            this.data.madeTransaction!.user_id
          );

          if (hasUserCached) {
            this.userData = this.authService.commonUsersData.get(
              this.data.madeTransaction!.user_id
            ) as PublicUserData;
          }
          this._checkIfUserCanEdit();
        });
    }
  }

  private _checkIfUserCanEdit() {
    if (!this.userData) {
      return;
    }

    if (
      this.data.madeTransaction?.user_id === this.authService.userData.value?.id
    ) {
      this.canEdit = true;
    } else {
      this.canEdit = false;
      this.form.disable();
    }
  }

  fetchLists() {
    this.fetching = true;

    const $accounts: Observable<Account[]> = this.accService.$account;
    const $scopes: Observable<Scope[]> = this.scopeService.$scopes;

    combineLatest([$accounts, $scopes]).subscribe({
      next: ([accounts, scopes]) => {
        const groups = new Set<AccountType>(accounts.map((x) => x.data.type));

        const groupedAccounts: { type: AccountType; accounts: Account[] }[] = [
          ...groups,
        ].map((group) => {
          return {
            type: group,
            accounts: accounts.filter((x) => x.data.type === group),
          };
        });
        this.userAccounts = groupedAccounts;
        this.userScopes = scopes;
        this.setDefaultScopeAndCat();
        this.fetching = false;
      },
    });
  }

  setDefaultScopeAndCat() {
    const firstPrivateScope = this.userScopes.find((x) => !x.data.shared);
    if (firstPrivateScope) {
      this.form.get('scope')?.setValue(firstPrivateScope);
      this.form.get('category')?.enable();
      this.categories = firstPrivateScope.getCategories();
      this.form
        .get('category')
        ?.setValue(firstPrivateScope.getDefaultCategory());
    }

    const prefixedScope = this.userScopes.find(
      (x) => x.data._id === this.data.scope?._id
    );
    if (prefixedScope) {
      const prefixedCategory = prefixedScope
        .getCategories()
        .find((x) => x.name === this.data.scope?.category.name);

      if (prefixedCategory) {
        this.form.get('scope')?.setValue(prefixedScope);
        this.form.get('category')?.setValue(prefixedCategory);
      }
    }
    this._checkIfUserCanEdit();
  }

  onSwapCheckboxChange() {
    if (this.swap) {
      this.form.controls['origin'].enable();
      this.form.controls['destination'].enable(); // Habilita la selección de cuenta secundaria
      this.form.controls['scope'].disable();
      // Preseleccionar la categoría swap si existe
      const swapCategory = this.categories.find(
        (cat) => cat.name.toLowerCase() === 'swap'
      );
      if (swapCategory) {
        this.form.controls['category'].setValue(swapCategory);
        this.form.controls['category'].disable();
      }
    } else {
      this.form.controls['origin'].disable();
      this.form.controls['destination'].disable(); // Deshabilita la cuenta secundaria
      this.form.controls['scope'].enable();
      this.form.controls['category'].enable();
    }
    this.form.updateValueAndValidity();
  }

  commit(remove = false) {
    const { amount, description, date, scope, category, origin, destination } =
      this.form.getRawValue();
    this.data.setAmount(amount);
    this.data.setDescription(description);
    this.data.setDate(date);

    console.log(origin, destination);

    const scopedCat: ScopedCategory = {
      _id: scope.data._id,
      name: scope.data.name,
      icon: scope.data.icon,
      category: category,
    };
    this.data.setScope(scopedCat);
    this.data.setCategory(category);

    // Lógica para swap
    if (!this.hasOriginal && this.swap) {
      // Validar cuentas distintas
      if (origin?.data._id === destination?.data._id) {
        this.dialog.open(ConfirmationComponent, {
          data: {
            title: 'Error',
            message: 'La cuenta destino debe ser distinta a la origen.',
          },
        });
        return;
      }
      // Buscar categoría swap
      const swapCategory = this.categories.find(
        (cat) => cat.name.toLowerCase() === 'swap'
      );
      if (!swapCategory) {
        this.dialog.open(ConfirmationComponent, {
          data: {
            title: 'Error',
            message: 'No se encontró la categoría swap.',
          },
        });
        return;
      }
      // Descripción automática para swap
      const autoDescription = `Swap between "${origin?.data.name}" and "${destination?.data.name}"`;
      this.data.setDescription(autoDescription);
      const request = this.data.generateRequest();
      // Crear transacción swap usando la clase opuesta
      let swapData: Transaction;
      if (this.data instanceof IncomingTransaction) {
        // Si la original es Incoming, la swap es Outgoing
        swapData = new OutgoingTransaction(origin);
      } else if (this.data instanceof OutgoingTransaction) {
        // Si la original es Outgoing, la swap es Incoming
        swapData = new IncomingTransaction(destination);
      } else {
        // Fallback: mantener la lógica anterior
        swapData = Object.create(Object.getPrototypeOf(this.data));
      }
      console.log(swapData);

      swapData.setAmount(amount);
      swapData.setDescription(autoDescription);
      swapData.setDate(date);
      /*       swapData.setOrigin(origin);
      swapData.setDestination(destination); */
      swapData.setScope(scopedCat);
      swapData.setCategory(swapCategory);
      const swapRequest = swapData.generateRequest();
      this.fetching = true;
      this.tranService
        .createSwapTransactions([request, swapRequest])
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: () => {
            this.dialog.open(ConfirmationComponent, {
              data: {
                title: 'Error',
                message: 'No se pudo crear la transacción swap.',
              },
            });
          },
        });
      return;
    }

    if (this.hasOriginal) {
      this.dialog
        .open(ConfirmationComponent, {
          data: { title: remove ? 'Delete' : 'Update' },
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            const request = this.data.generateModificationRequest();
            this.fetching = true;
            let $obs: Observable<unknown>;

            // delete or update
            if (remove) {
              $obs = this.tranService.deleteTransaction(
                this.data.madeTransaction!._id
              );
            } else {
              $obs = this.tranService.updateTransaction(
                this.data.madeTransaction!._id,
                request
              );
            }

            $obs
              .subscribe({
                next: () => {
                  this.dialogRef.close(true);
                },
              })
              .add(() => {
                this.fetching = true;
              });
          }
        });
    } else {
      const request = this.data.generateRequest();
      this.fetching = true;
      this.tranService
        .createTransaction(request)
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
        })
        .add(() => {
          this.fetching = true;
        });
    }
  }

  get hasOriginal(): boolean {
    return Boolean(this.data.madeTransaction);
  }

  get originalChanged(): boolean {
    if (this.data?.madeTransaction) {
      const { amount, description, scope, category } = this.form.getRawValue();
      if (this.data?.madeTransaction.description !== description) return true;
      if (Math.abs(this.data?.madeTransaction.amount) !== Math.abs(amount))
        return true;

      if (this.data?.madeTransaction.scope._id !== scope?.data?._id)
        return true;
      if (this.data?.madeTransaction.scope.category.name !== category?.name)
        return true;
    }
    return false;
  }

  get swapEnabled(): boolean {
    const scope = this.form?.get('scope')?.value;
    if (!scope) return false;
    const categories = scope.getCategories ? scope.getCategories() : [];
    return categories.some(
      (cat: Category) => cat.name.toLowerCase() === 'swap'
    );
  }
}
