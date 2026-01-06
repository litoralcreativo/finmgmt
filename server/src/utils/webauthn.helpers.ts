import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
  VerifyRegistrationResponseOpts,
  VerifyAuthenticationResponseOpts,
} from "@simplewebauthn/server";

// Configuración de Relying Party (RP)
export const rpID = process.env.WEBAUTHN_RPID || "localhost";
export const rpName = process.env.WEBAUTHN_RPNAME || "FinMgmt";
export const origin = process.env.WEBAUTHN_ORIGIN || "http://localhost:4200";

// Helpers para WebAuthn
export function getRegistrationOptions(
  opts: Omit<GenerateRegistrationOptionsOpts, "rpID" | "rpName">
) {
  return generateRegistrationOptions({
    rpID,
    rpName,
    ...opts,
  });
}

export function getAuthenticationOptions(
  opts: Omit<GenerateAuthenticationOptionsOpts, "rpID">
) {
  return generateAuthenticationOptions({
    rpID,
    ...opts,
  });
}

export async function verifyAttestationResponse(
  opts: VerifyRegistrationResponseOpts
): Promise<VerifiedRegistrationResponse> {
  return verifyRegistrationResponse({
    ...opts,
    expectedRPID: rpID,
    expectedOrigin: origin,
  });
}

export async function verifyAssertionResponse(
  opts: VerifyAuthenticationResponseOpts
): Promise<VerifiedAuthenticationResponse> {
  return verifyAuthenticationResponse({
    ...opts,
    expectedRPID: rpID,
    expectedOrigin: origin,
  });
}
