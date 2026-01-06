import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { routes } from 'src/environments/routes';

@Injectable({ providedIn: 'root' })
export class WebauthnService {
  constructor(private http: HttpClient) {}

  // Utilidades para base64url <-> ArrayBuffer
  private bufferDecode(value: string): ArrayBuffer {
    value = value.replace(/-/g, '+').replace(/_/g, '/');
    const pad = value.length % 4;
    if (pad) value += '='.repeat(4 - pad);
    return Uint8Array.from(atob(value), (c) => c.charCodeAt(0)).buffer;
  }
  private bufferEncode(buffer: ArrayBuffer): string {
    let str = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // REGISTRO (alta)
  async registerStart(username: string) {
    return firstValueFrom(
      this.http.post<any>(routes.auth.webauthnRegisterRequest, { username })
    );
  }
  async registerFinish(username: string, attestationResponse: any) {
    return firstValueFrom(
      this.http.post<any>(routes.auth.webauthnRegisterResponse, {
        username,
        attestationResponse,
      })
    );
  }

  // LOGIN
  async loginStart(username: string) {
    return firstValueFrom(
      this.http.post<any>(routes.auth.webauthnLoginRequest, { username })
    );
  }
  async loginFinish(username: string, assertionResponse: any) {
    const result = await firstValueFrom(
      this.http.post<any>(routes.auth.webauthnLoginResponse, {
        username,
        assertionResponse,
      })
    );
    // Guardar token si viene en la respuesta
    if (result && result.token) {
      sessionStorage.setItem('token', result.token);
      localStorage.setItem('lastLoginEmail', username);
    }
    return result;
  }

  // Adaptar opciones para navigator.credentials.create
  public prepareCredentialCreationOptions(options: any): any {
    return {
      ...options,
      challenge: this.bufferDecode(options.challenge),
      user: {
        ...options.user,
        id: this.bufferDecode(options.user.id),
      },
      excludeCredentials: (options.excludeCredentials || []).map(
        (cred: any) => ({
          ...cred,
          id: this.bufferDecode(cred.id),
        })
      ),
    };
  }

  // Adaptar opciones para navigator.credentials.get
  public prepareCredentialRequestOptions(options: any): any {
    return {
      ...options,
      challenge: this.bufferDecode(options.challenge),
      allowCredentials: (options.allowCredentials || []).map((cred: any) => ({
        ...cred,
        id: this.bufferDecode(cred.id),
      })),
    };
  }

  // Adaptar respuesta de create() para backend
  public formatAttestationResponse(cred: any): any {
    return {
      id: cred.id,
      rawId: this.bufferEncode(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: this.bufferEncode(cred.response.clientDataJSON),
        attestationObject: this.bufferEncode(cred.response.attestationObject),
      },
      clientExtensionResults: cred.getClientExtensionResults?.() || {},
    };
  }

  // Adaptar respuesta de get() para backend
  public formatAssertionResponse(cred: any): any {
    return {
      id: cred.id,
      rawId: this.bufferEncode(cred.rawId),
      type: cred.type,
      response: {
        clientDataJSON: this.bufferEncode(cred.response.clientDataJSON),
        authenticatorData: this.bufferEncode(cred.response.authenticatorData),
        signature: this.bufferEncode(cred.response.signature),
        userHandle: cred.response.userHandle
          ? this.bufferEncode(cred.response.userHandle)
          : undefined,
      },
      clientExtensionResults: cred.getClientExtensionResults?.() || {},
    };
  }

  // Verificar disponibilidad de WebAuthn
  public isWebAuthnAvailable(): boolean {
    return !!(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function'
    );
  }
}
