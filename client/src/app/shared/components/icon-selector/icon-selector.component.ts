import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-icon-selector',
  templateUrl: './icon-selector.component.html',
  styleUrls: ['./icon-selector.component.scss'],
})
export class IconSelectorComponent implements OnInit {
  icons: string[];
  catIcons: [string, string[]][];

  @Output('selection') selection: EventEmitter<string> = new EventEmitter();

  constructor(private iconService: IconService) {}

  ngOnInit(): void {
    this.icons = [...this.iconService.icons];
    this.catIcons = Array.from(this.iconService.catIcons.entries());
  }

  changeIcon(icon: string) {
    this.selection.emit(icon);
  }
}
