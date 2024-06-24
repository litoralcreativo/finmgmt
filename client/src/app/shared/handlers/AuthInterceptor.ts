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
    const onError = req.headers.get('on-error');
    const skipAuth = req.headers.get('skip-auth');

    let modifiedReq = req.clone();

    if (onError) {
      // take out the header
      modifiedReq = modifiedReq.clone({
        headers: modifiedReq.headers.delete('on-error'),
      });
    }

    if (token) {
      if (skipAuth) {
        modifiedReq = modifiedReq.clone({
          headers: modifiedReq.headers.delete('skip-auth'),
        });
      } else {
        modifiedReq = modifiedReq.clone({
          headers: modifiedReq.headers.set('Authorization', `Bearer ${token}`),
        });
      }
    } else if (skipAuth) {
      modifiedReq = modifiedReq.clone({
        headers: modifiedReq.headers.delete('skip-auth'),
      });
    }

    return next.handle(modifiedReq).pipe(
      tap({
        next: (res) => {
          return res;
        },
        error: (errorResponse: HttpErrorResponse) => {
          const onError = req.headers.get('on-error');
          if (onError === 'skip-notify') return;
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
