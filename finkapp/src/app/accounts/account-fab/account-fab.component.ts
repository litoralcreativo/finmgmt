import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-account-fab',
  templateUrl: './account-fab.component.html',
  styleUrl: './account-fab.component.scss',
})
export class AccountFABComponent {
  hide = false;
  actionsShown = false;

  @Output() action = new EventEmitter<'in' | 'out'>();

  toggleActions() {
    this.actionsShown = !this.actionsShown;
  }

  emitAction(action: 'in' | 'out') {
    this.action.emit(action);
    this.toggleActions();
    this.hide = true;
  }
}
