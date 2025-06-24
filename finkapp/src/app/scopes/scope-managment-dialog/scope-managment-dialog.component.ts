import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ScopeDTO } from 'src/app/shared/models/scope.model';
import { ScopeService } from 'src/app/shared/services/scope.service';
import { FetchingFlag } from 'src/app/shared/utils/fetching-flag';

@Component({
  selector: 'app-scope-managment-dialog',
  templateUrl: './scope-managment-dialog.component.html',
  styleUrls: ['./scope-managment-dialog.component.scss'],
})
export class ScopeManagmentDialogComponent
  extends FetchingFlag
{
  iconSelectorOpen = false;
  scopeDTO!: ScopeDTO;

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    icon: new FormControl('home', [Validators.required]),
    shared: new FormControl(false),
  });

  public dialogRef = inject(MatDialogRef<ScopeManagmentDialogComponent>);
  public scopeService = inject(ScopeService);

  constructor() {
    super();
  }

  confirm() {
    this.scopeDTO = {
      name: this.form.controls['name'].value,
      icon: this.form.controls['icon'].value,
      shared: this.form.controls['shared'].value === 'true',
    };

    this.fetching = true;
    this.form.disable();

    this.scopeService
      .createScope(this.scopeDTO)
      .subscribe(() => {
        this.dialogRef.close(true);
      })
      .add(() => {
        this.fetching = false;
        this.form.enable();
      });
  }

  changeIcon(icon: string) {
    this.form.controls['icon'].setValue(icon);
    this.iconSelectorOpen = false;
  }
}
