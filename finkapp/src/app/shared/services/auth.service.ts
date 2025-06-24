import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { PublicUserData } from '../models/userdata.model';
import { routes } from 'src/environments/routes';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenService = inject(TokenService);
  private http = inject(HttpClient);
  private router = inject(Router);

  public commonUsersDataEmitter = new BehaviorSubject<boolean>(true);
  private _commonUsersData = new Map<string, PublicUserData | undefined>();
  public get commonUsersData(): Map<string, PublicUserData | undefined> {
    return this._commonUsersData;
  }

  private _userData = new BehaviorSubject<PublicUserData | undefined>(
    undefined
  );
  public get userData() {
    return this._userData;
  }
  fetching: boolean;

  private authStatusListener: BehaviorSubject<boolean>;
  private reauthInProgress = false;

  constructor() {
    this.authStatusListener = new BehaviorSubject<boolean>(
      this.tokenService.isAuthenticated()
    );
    this.fetchUserInfo();
  }

  login(username: string, password: string): Observable<any> {
    this.fetching = true;
    return this.http
      .post<{ token: string }>(
        routes.auth.login,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        switchMap((response) => {
          const token = (response as { token: string }).token;
          if (token) localStorage.setItem('token', token);
          this.authStatusListener.next(true);
          return this.userInfo().pipe(
            tap(() => {
              this.fetching = false;
              this.router.navigate(['accounts']);
              /* if (response.redirectTo) {
              } */
            })
          );
        }),
        catchError((err) => {
          this.fetching = false;
          throw err;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    this.userData.next(undefined);
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Observable<undefined> {
    return this.http.post<undefined>(routes.auth.register, data).pipe(
      tap(() => {
        this.fetching = false;
      }),
      catchError((err) => {
        this.fetching = false;
        throw err;
      })
    );
  }

  reauth(): Subscription {
    if (this.reauthInProgress) return new Subscription(); // Evita múltiples llamadas

    this.reauthInProgress = true;
    return this.http.get(routes.auth.reauth).subscribe({
      next: (res) => {
        const token = (res as { token: string }).token;
        if (token) localStorage.setItem('token', token);
        this.authStatusListener.next(true);
      },
      complete: () => {
        this.reauthInProgress = false;
      },
      error: () => {
        this.reauthInProgress = false;
      },
    });
  }

  private fetchUserInfo() {
    if (!this.tokenService.getToken()) return;

    this.userInfo().subscribe({
      next: (userdata) => {
        this._userData.next(userdata);
        this._commonUsersData.set(userdata.id, userdata);
        this.commonUsersDataEmitter.next(true);
        this.router.navigate(['accounts']);
      },
      error: (err) => {
        if (err.error?.logout) {
          this.logout();
        }
      },
    });
  }

  userInfo(): Observable<PublicUserData> {
    return this.http
      .get<PublicUserData>(routes.auth.user, {
        withCredentials: true,
      })
      .pipe(
        tap((userdata) => {
          this._userData.next(userdata);
        })
      );
  }

  getForeingUserData(userId: string) {
    this._commonUsersData.set(userId, undefined);
    return this.http.get<PublicUserData>(routes.auth.foreinguser(userId)).pipe(
      tap((userdata) => {
        this._commonUsersData.set(userdata.id, userdata);
        this.commonUsersDataEmitter.next(true);
      })
    );
  }
}
