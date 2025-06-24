import { Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Scope } from 'src/app/shared/models/scope.model';

@Component({
  selector: 'app-scope-card',
  templateUrl: './scope-card.component.html',
  styleUrl: './scope-card.component.scss',
})
export class ScopeCardComponent {
  @Input() scope!: Scope;
  @Input() ripple = true;

  private router = inject(Router);
  private aRoute = inject(ActivatedRoute);

  onCardClick() {
    if (!this.ripple) return;
    else this.goToScope();
  }

  goToScope() {
    this.router.navigate([this.scope.data._id], { relativeTo: this.aRoute });
  }
}
