import { Component, OnInit, inject } from '@angular/core';
import { PublicUserData } from 'src/app/shared/models/userdata.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit {
  private authService = inject(AuthService);
  user?: PublicUserData;

  ngOnInit(): void {
    this.authService.userData.subscribe((user) => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
  }
}
