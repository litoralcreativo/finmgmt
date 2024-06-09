import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from 'src/app/shared/models/category.model';
import { Scope } from 'src/app/shared/models/scope.model';
import { ScopeService } from 'src/app/shared/services/scope.service';

@Component({
  selector: 'app-scope',
  templateUrl: './scope.component.html',
  styleUrls: ['./scope.component.scss'],
})
export class ScopeComponent implements OnInit {
  scopeId: string;
  scope: Scope;
  scopeCategories: Category[];
  fixed: Category[] = [];
  variable: Category[] = [];

  constructor(
    private aRoute: ActivatedRoute,
    private scopeService: ScopeService
  ) {}

  ngOnInit(): void {
    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('scopeId');
      if (!id) throw new Error('No accountId provided');

      this.scopeId = id;
      this.scopeService.getById(this.scopeId).subscribe((scope) => {
        this.scope = scope;
        this.scopeCategories = scope.getCategories();
        this.fixed = this.scopeCategories.filter((x) => x.fixed);
        this.variable = this.scopeCategories.filter((x) => !x.fixed);
      });
    });
  }
}
