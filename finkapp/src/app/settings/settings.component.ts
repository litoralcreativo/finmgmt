import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private authService = inject(AuthService);
  logout() {
    this.authService.logout();
  }
}
