import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthService } from '../shared/services/auth.service';
import { MatDrawerContainer } from '@angular/material/sidenav';

export type NavItem = {
  name: string;
  route: string;
  icon: string;
  active?: boolean;
};

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  loggedIn: boolean = false;
  @ViewChild(MatDrawerContainer) drawerContainer: MatDrawerContainer;

  navItems: NavItem[] = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
      active: false,
    },
    {
      name: 'Accounts',
      route: '/accounts',
      icon: 'wallet',
      active: false,
    },
  ];

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    public authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._updateActiveNavItem(event.urlAfterRedirects);
      }
    });

    this.authService.userData.subscribe((user) => {
      this.loggedIn = !!user;

      if (!user) this.drawerContainer?.close();
      else this.drawerContainer?.open();
    });
  }

  private _updateActiveNavItem(currentRoute: string) {
    this.navItems.forEach((item) => {
      item.active = item.route === currentRoute;
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
      .subscribe((result) => {
        switch (result) {
          case 'ok':
            this.drawerContainer.open();
            break;
          case 'changeDialog':
            this.openRegisterDialog();
            break;
          default:
            break;
        }
      });
  }

  openRegisterDialog() {
    this.dialog
      .open(RegisterComponent, { width: '450px' })
      .afterClosed()
      .subscribe((result) => {
        switch (result) {
          case 'ok':
            break;
          case 'changeDialog':
            this.openLoginDialog();
            break;
          default:
            break;
        }
      });
  }
}
