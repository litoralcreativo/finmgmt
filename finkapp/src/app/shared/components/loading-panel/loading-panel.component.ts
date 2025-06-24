import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-panel',
  templateUrl: './loading-panel.component.html',
  styleUrls: ['./loading-panel.component.scss'],
})
export class LoadingPanelComponent {
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() spinner = true;
  @Input() spinnerSize = 30;

}
