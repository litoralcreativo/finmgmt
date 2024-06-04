import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountData } from 'src/app/shared/models/accountData.model';
import { AccountService } from 'src/app/shared/services/account.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-account-managment-dialog',
  templateUrl: './account-managment-dialog.component.html',
  styleUrls: ['./account-managment-dialog.component.scss'],
})
export class AccountManagmentDialogComponent
  extends FetchingFlag
  implements OnInit
{
  form: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(32),
    ]),
    type: new FormControl('', [Validators.required]),
    symbol: new FormControl('', [Validators.required]),
  });

  constructor(
    private accService: AccountService,
    public dialogRef: MatDialogRef<AccountManagmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountData | undefined
  ) {
    super();
  }

  ngOnInit(): void {}

  submit() {
    const aacData: AccountData = this.form.value;

    this.fetching = true;
    this.form.disable();
    this.accService
      .createAccount(aacData)
      .subscribe({
        next: (ok) => {
          this.dialogRef.close(true);
        },
        error: (err) => {},
      })
      .add(() => {
        this.fetching = false;
        this.form.enable();
      });
  }
}
