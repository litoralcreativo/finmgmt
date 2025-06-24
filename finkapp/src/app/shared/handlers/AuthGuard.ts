import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, catchError } from 'rxjs/operators';
import { PublicUserData } from '../models/userdata.model';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    return this.authService.userData.pipe(
      take(1),
      switchMap((user: PublicUserData | undefined) => {
        if (user) {
          return of(true);
        } else {
          return this.authService.userInfo().pipe(
            map((fetchedUser: PublicUserData) => {
              if (fetchedUser) {
                return true;
              } else {
                this.router.navigate(['/']);
                return false;
              }
            }),
            catchError(() => {
              this.router.navigate(['/']);
              return of(false);
            })
          );
        }
      })
    );
  }
}
