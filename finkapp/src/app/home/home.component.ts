import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { LoginComponent } from '../shell/login/login.component';
import { WebauthnService } from '../shared/services/webauthn.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private webauthnService = inject(WebauthnService);

  async ngOnInit() {
    // Si ya hay token en sessionStorage, no hacer login biométrico ni mostrar login
    const token = sessionStorage.getItem('token');
    if (token) {
      this.router.navigate(['accounts']);
      return;
    }

    // Detectar si es dispositivo móvil
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    console.log(navigator.userAgent);

    if (isMobile) {
      await this.loginBiometrico();
    } else {
      this.openLoginDialog();
    }
  }

  async loginBiometrico() {
    // Intento de login biométrico automático

    const lastLoginEmail = localStorage.getItem('lastLoginEmail');

    if (lastLoginEmail && this.webauthnService.isWebAuthnAvailable()) {
      try {
        const { options } = await this.webauthnService.loginStart(
          lastLoginEmail
        );
        const publicKey =
          this.webauthnService.prepareCredentialRequestOptions(options);
        const cred = await navigator.credentials.get({ publicKey });
        if (cred) {
          const assertionResponse =
            this.webauthnService.formatAssertionResponse(cred);
          await this.webauthnService.loginFinish(
            lastLoginEmail,
            assertionResponse
          );
          this.router.navigate(['accounts']);
          return;
        }
      } catch (e) {
        // Si falla biometría, mostrar login clásico
        this.openLoginDialog();
        return;
      }
    }
    // Si no hay email guardado o no hay biometría, mostrar login clásico
    this.openLoginDialog();
  }

  onGetStartedClick() {
    this.openLoginDialog();
  }

  openLoginDialog() {
    this.dialog.open(LoginComponent, {
      width: '400px',
    });
  }
}
