import { Component, Input } from '@angular/core';
import { NavItem } from 'src/app/shared/models/navItem.model';

@Component({
  selector: 'app-bottom-toolbar',
  templateUrl: './bottom-toolbar.component.html',
  styleUrl: './bottom-toolbar.component.scss',
})
export class BottomToolbarComponent {
  @Input() items = new Map<string, NavItem>([]);
}
