import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScopeService } from '../shared/services/scope.service';
import { ScopeManagmentDialogComponent } from './scope-managment-dialog/scope-managment-dialog.component';

@Component({
  selector: 'app-scopes',
  templateUrl: './scopes.component.html',
  styleUrl: './scopes.component.scss',
})
export class ScopesComponent {
  dialogOpened: boolean;
  constructor(private dialog: MatDialog, private scopeService: ScopeService) {}
  openNewScopeDialog() {
    this.dialogOpened = true;
    this.dialog
      .open(ScopeManagmentDialogComponent, {
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.scopeService.getScopes();
        }
      })
      .add(() => {
        this.dialogOpened = false;
      });
  }
}
