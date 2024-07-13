import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Scope } from 'src/app/shared/models/scope.model';

@Component({
  selector: 'app-scope-card',
  templateUrl: './scope-card.component.html',
  styleUrl: './scope-card.component.scss',
})
export class ScopeCardComponent {
  @Input('scope') scope: Scope;
  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  goToScope() {
    this.router.navigate([this.scope.data._id], { relativeTo: this.aRoute });
  }
}
