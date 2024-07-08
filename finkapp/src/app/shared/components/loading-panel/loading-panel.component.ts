import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-panel',
  templateUrl: './loading-panel.component.html',
  styleUrls: ['./loading-panel.component.scss'],
})
export class LoadingPanelComponent implements OnInit {
  @Input('theme') theme: 'light' | 'dark' = 'light';
  @Input('spinner') spinner: boolean = true;
  @Input('spinnerSize') spinnerSize: number = 30;

  constructor() {}

  ngOnInit(): void {}
}
