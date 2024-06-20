import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Scope } from '../shared/models/scope.model';
import { ScopeService } from '../shared/services/scope.service';
import { ScopeManagmentDialogComponent } from './scope-managment-dialog/scope-managment-dialog.component';

@Component({
  selector: 'app-scopes',
  templateUrl: './scopes.component.html',
  styleUrls: ['./scopes.component.scss'],
})
export class ScopesComponent implements OnInit {
  scopes: Scope[] = [];
  constructor(private scopesService: ScopeService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.scopesService.$scopes.subscribe((spa) => {
      this.scopes = spa;
    });
  }

  openNewSccopeDialog() {
    this.dialog
      .open(ScopeManagmentDialogComponent, {
        width: '450px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.scopesService.getScopes();
        }
      });
  }
}
