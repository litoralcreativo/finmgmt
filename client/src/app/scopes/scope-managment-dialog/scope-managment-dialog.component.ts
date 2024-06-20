import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Scope, ScopeDTO } from 'src/app/shared/models/scope.model';
import { IconService } from 'src/app/shared/services/icon.service';
import { ScopeService } from 'src/app/shared/services/scope.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-scope-managment-dialog',
  templateUrl: './scope-managment-dialog.component.html',
  styleUrls: ['./scope-managment-dialog.component.scss'],
})
export class ScopeManagmentDialogComponent
  extends FetchingFlag
  implements OnInit
{
  iconSelectorOpen: boolean = false;
  scopeDTO: ScopeDTO;

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    icon: new FormControl('more_horiz', [Validators.required]),
    shared: new FormControl(false),
  });

  constructor(
    public dialogRef: MatDialogRef<ScopeManagmentDialogComponent>,
    public scopeService: ScopeService,
    private snackbar: MatSnackBar
  ) {
    super();
  }

  ngOnInit(): void {}

  confirm() {
    this.scopeDTO = {
      name: this.form.controls.name.value,
      icon: this.form.controls.icon.value,
      shared: this.form.controls.shared.value,
    };

    this.fetching = true;
    this.form.disable();
    /* 
    if (this.data.category) {
      // edit
      this.scopeService
        .editCategory(
          this.data.scope.data._id,
          this.data.category.name,
          this.category
        )
        .subscribe((res: any) => {
          if (res.result?.category?.modifiedCount > 0) {
            let categoriesCount: number = res.result?.category?.modifiedCount;
            let transactionsCount: number =
              res.result?.transactions?.modifiedCount;
            this.snackbar.open(
              `Update ${categoriesCount} category and ${transactionsCount} transactions`,
              '✖',
              {
                horizontalPosition: 'start',
                verticalPosition: 'bottom',
                panelClass: 'matsnack-error',
              }
            );
          }
          this.dialogRef.close(true);
        })
        .add(() => {
          this.fetching = false;
          this.form.enable();
        });
    } else {
      // create
      this.scopeService
        .createCategory(this.data.scope.data._id, this.category)
        .subscribe((res) => {
          this.dialogRef.close(true);
        })
        .add(() => {
          this.fetching = false;
          this.form.enable();
        });
    } */

    this.scopeService
      .createScope(this.scopeDTO)
      .subscribe((res) => {
        this.dialogRef.close(true);
      })
      .add(() => {
        this.fetching = false;
        this.form.enable();
      });
  }

  changeIcon(icon: string) {
    this.form.controls.icon.setValue(icon);
    this.iconSelectorOpen = false;
  }
}
