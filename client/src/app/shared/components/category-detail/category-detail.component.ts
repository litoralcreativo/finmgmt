import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '../../models/category.model';
import { Scope } from '../../models/scope.model';
import { ScopeService } from '../../services/scope.service';
import { FetchingFlag } from '../../utils/fetching-flag';

export type CategoryDialogDataModel = {
  scope: Scope;
  category?: Category;
};

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss'],
})
export class CategoryDetailComponent extends FetchingFlag implements OnInit {
  category: Category;
  icons: string[] = [
    'more_horiz',
    'attach_money',
    'smartphone',
    'credit_card',
    'fitness_center',
    'school',
    'nightlife',
    'medication_liquid',
    'volunteer_activism',
    'redeem',
    'checkroom',
    'agriculture',
    'ssid_chart',
    'show_chart',
    'savings',
    'luggage',
    'swap_horiz',
  ];

  form: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    icon: new FormControl('more_horiz', [Validators.required]),
    fixed: new FormControl(false),
  });

  constructor(
    public dialogRef: MatDialogRef<CategoryDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogDataModel,
    public scopeService: ScopeService
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.data) throw new Error('No category and scope data provided');

    if (this.data.category) {
      this.category = {
        name: this.data.category.name,
        icon: this.data.category.icon,
        fixed: Boolean(this.data.category.fixed),
      };
      this.form.controls.name.setValue(this.category.name);
      this.form.controls.icon.setValue(this.category.icon);
      this.form.controls.fixed.setValue(this.category.fixed);
    }
  }

  confirm() {
    if (this.data.category) {
      // edit
      this.scopeService.editCategory(
        this.data.scope.data._id,
        this.data.category.name,
        this.category
      );
    } else {
      // create
      this.scopeService.createCategory(this.data.scope.data._id, this.category);
    }
    this.dialogRef.close();
  }
}
