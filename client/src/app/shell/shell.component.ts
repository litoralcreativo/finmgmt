import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from '../shared/services/auth.service';
import { MatDrawerContainer } from '@angular/material/sidenav';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  loggedIn: boolean = false;
  @ViewChild(MatDrawerContainer) drawerContainer: MatDrawerContainer;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    public authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.userData.subscribe((user) => {
      this.loggedIn = !!user;

      if (!user) this.drawerContainer?.close();
    });
  }

  onNavLinkClick(to: string[]) {
    this.router.navigate(to, { relativeTo: this.aRoute });
  }

  public get fetching(): boolean {
    return this.authService.fetching;
  }

  openLoginDialog() {
    this.dialog
      .open(LoginComponent, { width: '400px' })
      .afterClosed()
      .subscribe((succesfulLogin) => {
        if (succesfulLogin) {
          this.drawerContainer.open();
        }
      });
  }
}
