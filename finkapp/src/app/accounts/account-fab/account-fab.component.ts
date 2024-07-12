import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-account-fab',
  templateUrl: './account-fab.component.html',
  styleUrl: './account-fab.component.scss',
})
export class AccountFABComponent {
  actionsShown: boolean = false;

  @Output('action') action: EventEmitter<'in' | 'out' | 'swap'> =
    new EventEmitter();

  toggleActions() {
    this.actionsShown = !this.actionsShown;
  }

  emitAction(action: 'in' | 'out' | 'swap') {
    this.action.emit(action);
    this.toggleActions();
  }
}
