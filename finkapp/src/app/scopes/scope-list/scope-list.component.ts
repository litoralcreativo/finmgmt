import { Component } from '@angular/core';
import { Scope } from 'src/app/shared/models/scope.model';
import { ScopeService } from 'src/app/shared/services/scope.service';

@Component({
  selector: 'app-scope-list',
  templateUrl: './scope-list.component.html',
  styleUrl: './scope-list.component.scss',
})
export class ScopeListComponent {
  scopes: Scope[] = [];

  constructor(private scopeService: ScopeService) {}

  ngOnInit() {
    this.scopeService.$scopes.subscribe((spa) => {
      this.scopes = spa;
    });
  }
}
