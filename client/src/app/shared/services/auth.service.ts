import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { finalize, tap, switchMap, map } from 'rxjs/operators';
import { PublicUserData } from '../models/userdata.model';
import { routes } from 'src/environments/routes';

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

  constructor(private http: HttpClient, private router: Router) {
    this.fetchUserInfo(true).subscribe();
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
        finalize(() => {
          this.fetching = false;
        })
      );
  }

  logout(): void {
    this.fetching = true;
    this.http
      .post(routes.auth.logout, {}, { withCredentials: true })
      .subscribe((x) => {
        this.router.navigate(['/']);
        this.userData.next(undefined);
        this.fetching = false;
      });
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Observable<any> {
    return this.http.post(routes.auth.register, data);
  }

  fetchUserInfo(
    checkIsAuth: boolean = false
  ): Observable<PublicUserData | undefined> {
    const authCheck$ = checkIsAuth
      ? this.http
          .get<boolean>(routes.auth.authenticated, {
            withCredentials: true,
          })
          .pipe(
            map((x: any) => {
              return x.isAuth;
            })
          )
      : of(true); // We assume the user is autenticated, to try to get its data

    return authCheck$
      .pipe(
        switchMap((isAuthenticated) => {
          if (isAuthenticated) {
            return this.http.get<PublicUserData>(routes.auth.user, {
              withCredentials: true,
            });
          } else {
            return of(undefined);
          }
        })
      )
      .pipe(
        tap((res) => {
          this.router.navigate(['/dashboard']);
          this._userData.next(res);
        })
      );
  }
}
