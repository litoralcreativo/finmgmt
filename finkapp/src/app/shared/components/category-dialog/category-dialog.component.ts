import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../models/category.model';
import { Scope } from '../../models/scope.model';
import { ScopeService } from '../../services/scope.service';

export interface CategoryDialogDataModel {
  scope: Scope;
  category?: Category;
}

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss',
})
export class CategoryDialogComponent implements OnInit {
  fetching = false;
  iconSelectorOpen = false;

  form: FormGroup;

  category?: Category;

  public dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  @Inject(MAT_DIALOG_DATA) public data: CategoryDialogDataModel;
  public scopeService = inject(ScopeService);
  public snackbar = inject(MatSnackBar);

  constructor() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      icon: new FormControl('more_horiz', [Validators.required]),
      fixed: new FormControl(false),
    });
  }

  ngOnInit() {
    if (!this.data) throw new Error('No category and scope data provided');

    if (this.data.category) {
      this.category = {
        name: this.data.category.name,
        icon: this.data.category.icon,
        fixed: Boolean(this.data.category.fixed),
      };
      this.form.controls['name'].setValue(this.category.name);
      this.form.controls['icon'].setValue(this.category.icon);
      this.form.controls['fixed'].setValue(this.category.fixed);
    }
  }

  confirm() {
    this.category = {
      name: this.form.controls['name'].value,
      icon: this.form.controls['icon'].value,
      fixed: this.form.controls['fixed'].value,
    };

    this.fetching = true;
    this.form.disable();

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
            const categoriesCount: number = res.result?.category?.modifiedCount;
            const transactionsCount: number =
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
        .subscribe(() => {
          this.dialogRef.close(true);
        })
        .add(() => {
          this.fetching = false;
          this.form.enable();
        });
    }
  }

  changeIcon(icon: string) {
    this.form.controls['icon'].setValue(icon);
    this.iconSelectorOpen = false;
  }
}
