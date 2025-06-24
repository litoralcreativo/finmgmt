import { Component, inject, OnInit } from '@angular/core';
import { Scope } from 'src/app/shared/models/scope.model';
import { ScopeService } from 'src/app/shared/services/scope.service';

@Component({
  selector: 'app-scope-list',
  templateUrl: './scope-list.component.html',
  styleUrl: './scope-list.component.scss',
})
export class ScopeListComponent implements OnInit {
  scopes: Scope[] = [];

  private scopeService = inject(ScopeService);

  ngOnInit() {
    this.scopeService.$scopes.subscribe((spa) => {
      this.scopes = spa;
    });
  }
}
