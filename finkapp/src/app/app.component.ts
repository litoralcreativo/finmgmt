import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'fink';
  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.userData.value !== undefined) {
      this.router.navigate(['dashboard']);
    }
  }
}
