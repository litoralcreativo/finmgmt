import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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

  @Input() categories = false;

  @Output() iconSelection = new EventEmitter<string>();
  @Output() categorySelection = new EventEmitter<Category>();
  scopes: Scope[];

  private iconService = inject(IconService);
  private scopeService = inject(ScopeService);

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
