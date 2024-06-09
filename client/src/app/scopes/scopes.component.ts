import { Component, OnInit } from '@angular/core';
import { Scope } from '../shared/models/scope.model';
import { ScopeService } from '../shared/services/scope.service';

@Component({
  selector: 'app-scopes',
  templateUrl: './scopes.component.html',
  styleUrls: ['./scopes.component.scss'],
})
export class ScopesComponent implements OnInit {
  scopes: Scope[] = [];
  constructor(private scopesService: ScopeService) {}

  ngOnInit(): void {
    this.scopesService.$scopes.subscribe((spa) => {
      this.scopes = spa;
    });
  }

  goToScope() {}
}
