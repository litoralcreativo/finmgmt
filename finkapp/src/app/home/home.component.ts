import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { LoginComponent } from '../shell/login/login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  ngOnInit() {
    if (this.auth.userData) this.router.navigate(['..']);
  }

  onGetStartedClick() {
    this.dialog.open(LoginComponent, {
      width: '400px',
    });
  }
}
