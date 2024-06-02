import { Injectable } from '@angular/core';
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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _snackBar: MatSnackBar) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap({
        next: (res) => {
          return res;
        },
        error: (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
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
