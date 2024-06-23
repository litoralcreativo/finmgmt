import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirmation',
  template: `
    <h1 mat-dialog-title>Confirm</h1>
    <div mat-dialog-content>Are you sure you want to confirm this action?</div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Close</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Yes</button>
    </div>
  `,
})
export class ConfirmationComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
