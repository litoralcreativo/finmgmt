import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';
import { Scope } from '../../models/scope.model';
import { IconService } from '../../services/icon.service';
import { ScopeService } from '../../services/scope.service';

@Component({
  selector: 'app-icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.scss'],
})
export class IconSelectorComponent implements OnInit {
  catIcons: [string, string[]][] = [];
  scopeIcons: [string, Category[]][] = [];

  @Input('categories') categories: boolean = false;

  @Output('iconSelection') iconSelection: EventEmitter<string> =
    new EventEmitter();
  @Output('categorySelection') categorySelection: EventEmitter<Category> =
    new EventEmitter();
  scopes: Scope[];

  constructor(
    private iconService: IconService,
    private scopeService: ScopeService
  ) {}

  ngOnInit(): void {
    this.catIcons = Array.from(this.iconService.catIcons.entries());
    if (this.categories) {
      this.fetchLists();
    }
  }

  fetchLists() {
    const $scopes: Observable<Scope[]> = this.scopeService.$scopes;
    $scopes.subscribe({
      next: (scopes) => {
        this.scopes = scopes;
        this.scopeIcons = scopes.map((x) => {
          return [x.data.name, x.getCategories()];
        });
      },
    });
  }

  changeIcon($event: string) {
    this.iconSelection.emit($event);
  }

  changeCategory($event?: Category) {
    this.categorySelection.emit($event);
  }
}
