import { Component, inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { WebauthnService } from '../shared/services/webauthn.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private webauthnService = inject(WebauthnService);
  private snackBar = inject(MatSnackBar);

  user = this.authService.userData; // Ajusta según tu AuthService
  biometricEnabled = false;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor() {}

  get userEmail() {
    return this.user?.value?.email || '';
  }

  async enableBiometric() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    try {
      const { options } = await this.webauthnService.registerStart(
        this.userEmail
      );
      const publicKey =
        this.webauthnService.prepareCredentialCreationOptions(options);
      const cred = await navigator.credentials.create({ publicKey });
      const attestationResponse =
        this.webauthnService.formatAttestationResponse(cred);
      await this.webauthnService.registerFinish(
        this.userEmail,
        attestationResponse
      );
      this.successMsg = 'Ingreso biométrico habilitado correctamente.';
    } catch (e: any) {
      this.errorMsg =
        e?.error?.msg || e?.message || 'Error al habilitar biometría.';
      console.log(e);

      this.snackBar.open(this.errorMsg, 'Cerrar', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}
