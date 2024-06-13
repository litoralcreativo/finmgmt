import { Injectable, InjectFlags, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private _snackBar: MatSnackBar
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
    }
    return next.handle(authReq).pipe(
      tap({
        next: (res) => {
          return res;
        },
        error: (errorResponse: HttpErrorResponse) => {
          this._snackBar.open(`${errorResponse.error.msg}`, '✖', {
            horizontalPosition: 'start',
            verticalPosition: 'bottom',
            panelClass: 'matsnack-error',
          });
        },
      })
    );
  }
}
