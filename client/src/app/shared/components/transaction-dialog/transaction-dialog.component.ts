import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountData } from '../../models/accountData.model';
import { FetchingFlag } from '../../utils/fetching-flag';

@Component({
  selector: 'app-transaction-dialog',
  templateUrl: './transaction-dialog.component.html',
  styleUrls: ['./transaction-dialog.component.scss'],
})
export class TransactionDialogComponent extends FetchingFlag implements OnInit {
  form: FormGroup = new FormGroup({
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(32),
    ]),
    type: new FormControl('', [Validators.required]),
    origin: new FormControl('', [Validators.required]),
    destination: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountData | undefined
  ) {
    super();
  }

  ngOnInit(): void {}

  commit() {}
}
