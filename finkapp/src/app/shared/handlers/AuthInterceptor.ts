import { inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const _snackBar = inject(MatSnackBar);

  const token = tokenService.getToken();
  const onError = req.headers.get('on-error');
  const skipAuth = req.headers.get('skip-auth');

  let modifiedReq = req.clone();

  if (onError) {
    // Eliminar el encabezado
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

  return next(modifiedReq).pipe(
    tap({
      next: (res) => {
        return res;
      },
      error: (errorResponse: HttpErrorResponse) => {
        const onError = req.headers.get('on-error');
        if (onError === 'skip-notify') return;
        _snackBar.open(`${errorResponse.error.msg}`, '✖', {
          horizontalPosition: 'start',
          verticalPosition: 'bottom',
          panelClass: 'matsnack-error',
        });
      },
    })
  );
};
