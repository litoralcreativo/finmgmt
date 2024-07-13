import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { finalize, tap, switchMap, map, catchError } from 'rxjs/operators';
import { PublicUserData } from '../models/userdata.model';
import { routes } from 'src/environments/routes';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _userData = new BehaviorSubject<PublicUserData | undefined>(
    undefined
  );
  public get userData() {
    return this._userData;
  }
  fetching: boolean;

  private authStatusListener: BehaviorSubject<boolean>;

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private router: Router
  ) {
    this.authStatusListener = new BehaviorSubject<boolean>(
      this.tokenService.isAuthenticated()
    );
    this.fetchUserInfo();
  }

  login(username: string, password: string): Observable<any> {
    this.fetching = true;
    return this.http
      .post(
        routes.auth.login,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        switchMap((response: any) => {
          const token = (response as any).token;
          if (token) localStorage.setItem('token', token);
          this.authStatusListener.next(true);
          return this.userInfo().pipe(
            tap((userdata) => {
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
  }): Observable<any> {
    return this.http.post(routes.auth.register, data).pipe(
      tap((response: any) => {
        this.fetching = false;
      }),
      catchError((err) => {
        this.fetching = false;
        throw err;
      })
    );
  }

  private fetchUserInfo() {
    if (!this.tokenService.getToken()) return;

    this.userInfo().subscribe({
      next: (userdata) => {
        this._userData.next(userdata);
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
}
