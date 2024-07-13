import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthService } from '../shared/services/auth.service';
import { MatDrawerContainer } from '@angular/material/sidenav';
import { SymbolChangeService } from '../shared/services/symbol-change.service';
import { BreakpointService } from '../shared/services/breakpoint.service';
import { SymbolChange } from '../shared/models/symbolChange.model';
import { NavItem } from '../shared/models/navItem.model';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  loggedIn: boolean = false;
  @ViewChild(MatDrawerContainer) drawerContainer: MatDrawerContainer;

  navItems: Map<string, NavItem> = new Map([]);

  changes: Map<string, SymbolChange> = new Map();
  screenSize: number;

  constructor(
    private router: Router,
    private aRoute: ActivatedRoute,
    public authService: AuthService,
    public dialog: MatDialog,
    private symbolChange: SymbolChangeService,
    private breakpointService: BreakpointService
  ) {
    this.navItems.set('Dashboard', {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard',
      active: false,
      disabled: true,
    });
    this.navItems.set('Accounts', {
      name: 'Accounts',
      route: '/accounts',
      icon: 'wallet',
      active: false,
    });
    this.navItems.set('Scopes', {
      name: 'Scopes',
      route: '/scopes',
      icon: 'business_center',
      active: false,
    });
    this.navItems.set('Calendar', {
      name: 'Calendar',
      route: '/calendar',
      icon: 'calendar_month',
      active: false,
    });
    this.navItems.set('Settings', {
      name: 'Settings',
      route: '/settings',
      icon: 'settings',
      active: false,
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._updateActiveNavItem(event.urlAfterRedirects);
      }
    });

    this.authService.userData.subscribe((user) => {
      this.loggedIn = !!user;

      /* if (!user) this.drawerContainer?.close();
      else this.drawerContainer?.open(); */
    });

    this.symbolChange.$prices.subscribe((x) => (this.changes = x));

    this.breakpointService.bpSubject.subscribe((x) => {
      switch (x) {
        case 'XSmall':
          this.screenSize = 1;
          break;
        case 'Small':
          this.screenSize = 2;
          break;
        case 'Medium':
          this.screenSize = 3;
          break;
        case 'Large':
          this.screenSize = 4;
          break;
        case 'XLarge':
          this.screenSize = 5;
          break;
      }
    });
  }

  private _updateActiveNavItem(currentRoute: string) {
    this.navItems.forEach((item) => {
      item.active = currentRoute.startsWith(item.route);
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
      .open(LoginComponent, { width: '400px', disableClose: true })
      .afterClosed()
      .subscribe((result) => {
        switch (result) {
          case 'ok':
            // this.drawerContainer.open();
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
      .open(RegisterComponent, { width: '450px', disableClose: true })
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

  goHome() {
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
  }
}
