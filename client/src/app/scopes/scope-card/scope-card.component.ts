import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Scope } from 'src/app/shared/models/scope.model';

@Component({
  selector: 'app-scope-card',
  templateUrl: './scope-card.component.html',
  styleUrls: ['./scope-card.component.scss'],
})
export class ScopeCardComponent implements OnInit {
  @Input('scope') scope: Scope;

  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  goToAccount() {
    this.router.navigate([this.scope.data._id], { relativeTo: this.aRoute });
  }
}
