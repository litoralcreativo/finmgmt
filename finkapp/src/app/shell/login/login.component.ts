import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { WebauthnService } from 'src/app/shared/services/webauthn.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<LoginComponent>);
  private webauthnService = inject(WebauthnService);

  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
  });

  public lastLoginEmail: string | null = null;
  public showBiometricOnly = false;

  ngOnInit(): void {
    this.lastLoginEmail = localStorage.getItem('lastLoginEmail');
    this.showBiometricOnly = !!(this.lastLoginEmail && this.canUseBiometrics);
    if (this.showBiometricOnly) {
      this.tryBiometricLogin();
    } else {
      this.updateFormDisableState();
    }
  }

  async tryBiometricLogin() {
    try {
      const { options } = await this.webauthnService.loginStart(
        this.lastLoginEmail!
      );
      const publicKey =
        this.webauthnService.prepareCredentialRequestOptions(options);
      const cred = await navigator.credentials.get({ publicKey });
      if (cred) {
        const assertionResponse =
          this.webauthnService.formatAssertionResponse(cred);
        await this.webauthnService.loginFinish(
          this.lastLoginEmail!,
          assertionResponse
        );
        this.dialogRef.close('ok');
        return;
      }
    } catch (e) {
      // Si falla biometría, mostrar formulario normal
      this.showBiometricOnly = false;
      this.updateFormDisableState();
    }
  }

  async login() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;

    // Login clásico
    this.authService
      .login(username, password)
      .subscribe(() => {
        localStorage.setItem('lastLoginEmail', username);
        this.dialogRef.close('ok');
      })
      .add(() => this.updateFormDisableState());
    this.updateFormDisableState();
  }

  updateFormDisableState() {
    if (this.fetching && this.form.enabled) {
      this.form.disable();
    } else if (!this.fetching && this.form.disabled) {
      this.form.enable();
    }
  }

  changeToRegister() {
    this.dialogRef.close('changeDialog');
  }

  close() {
    this.dialogRef.close(false);
  }

  public get fetching(): boolean {
    return this.authService.fetching;
  }

  public get canUseBiometrics(): boolean {
    return this.webauthnService.isWebAuthnAvailable();
  }
}
