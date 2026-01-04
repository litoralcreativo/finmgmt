import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { DbManager } from "../bdd/db";
import { ResponseStrategy } from "../models/response.model";
import { User } from "../models/user.model";
import { UserService } from "../services/user.service";
import jwt from "jsonwebtoken";
import {
  getRegistrationOptions,
  verifyAttestationResponse,
  getAuthenticationOptions,
  verifyAssertionResponse,
} from "../utils/webauthn.helpers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

let userService: UserService;
DbManager.getInstance().subscribe((x) => {
  if (x) userService = new UserService(x);
});

export const registration = (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const newUser = new User();
    newUser.setFirstName(firstName);
    newUser.setLastName(lastName);
    newUser.setEmail(email);
    newUser.setPassword(password);
    // Inicializar credenciales vacías para nuevos usuarios
    (newUser as any).credentials = [];

    userService.getByEmail(email).subscribe((user) => {
      if (user) {
        return res
          .status(400)
          .json({ ...new ResponseStrategy(400, "Email already used") });
      }

      userService.createOne(newUser).subscribe((val: any) => {
        res.status(200).json({
          ...new ResponseStrategy(200, "Successfuly registered"),
          user,
        });
      });
    });
  } catch (e: any) {
    res.status(400).json({ ...new ResponseStrategy(400, e.message) });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  try {
    passport.authenticate(
      "local",
      { session: false },
      (err: any, user: User) => {
        if (err) {
          return res.status(401).json({
            ...new ResponseStrategy(401, err),
          });
        }

        req.logIn(user, { session: false }, (err) => {
          if (err) {
            return next();
          }
          const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "6h",
          });
          return res.json({ redirectTo: "/dashboard", token });

          /* res.status(200).json({ redirectTo: "/dashboard" }); */
        });
      }
    )(req, res, next);
  } catch (e) {
    throw e;
  }
};

export const reautenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.id;

    const token = jwt.sign({ id: userId }, JWT_SECRET, {
      expiresIn: "6h",
    });
    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Fail to get user, internal server error"),
    });
  }
};

export const getUserInfo = (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    userService.getById(userId).subscribe({
      next: (user: User | null) => {
        if (!user) {
          return res
            .status(400)
            .json({ ...new ResponseStrategy(400, "User not found") });
        }
        return res.status(200).json({
          id: user._id,
          email: user.email,
          name: user.name,
        });
      },
      error: (err) => {
        throw new Error(err);
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Fail to get user, internal server error"),
    });
  }
};

export const getForeingUserInfo = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    userService.getById(id).subscribe({
      next: (user: User | null) => {
        if (!user) {
          return res
            .status(400)
            .json({ ...new ResponseStrategy(400, "User not found") });
        }
        return res.status(200).json({
          id: user._id,
          email: user.email,
          name: user.name,
        });
      },
      error: (err) => {
        throw new Error(err);
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Fail to get user, internal server error"),
    });
  }
};

// --- WebAuthn (biometría) ---
// Solicita challenge para registro
export const webauthnRegisterRequest = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res
        .status(400)
        .json(new ResponseStrategy(400, "Username requerido"));
    }
    userService.getByEmail(username).subscribe(async (user: User | null) => {
      if (!user) {
        return res
          .status(404)
          .json(new ResponseStrategy(404, "Usuario no encontrado"));
      }
      // Precaución: inicializar credentials si no existe (usuarios antiguos)
      if (!user.credentials) {
        user.credentials = [];
      }
      // Generar challenge y opciones de registro
      const options = await getRegistrationOptions({
        userID: Buffer.from(String(user._id), "utf8"),
        userName: user.email || user._id,
        excludeCredentials: user.credentials.map((c) => ({
          id: c.credentialID, // base64url string
        })),
        authenticatorSelection: {
          userVerification: "preferred",
          residentKey: "preferred",
          requireResidentKey: false,
        },
      });
      // Guardar challenge en la base de datos del usuario (usando un campo permitido, por ejemplo, 'webAuthnChallenge')
      userService
        .updateOneById(user._id, { webAuthnChallenge: options.challenge })
        .subscribe({
          next: () => res.json({ options }),
          error: () =>
            res
              .status(500)
              .json(new ResponseStrategy(500, "Error al guardar challenge")),
        });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ResponseStrategy(500, "Error en registro biométrico"));
  }
};

// Recibe y valida credencial de registro
export const webauthnRegisterResponse = async (req: Request, res: Response) => {
  try {
    const { username, attestationResponse } = req.body;
    if (!username || !attestationResponse) {
      return res
        .status(400)
        .json(new ResponseStrategy(400, "Datos incompletos"));
    }
    userService.getByEmail(username).subscribe(async (user: User | null) => {
      if (!user) {
        return res
          .status(404)
          .json(new ResponseStrategy(404, "Usuario no encontrado"));
      }
      // Obtener challenge guardado desde la base de datos
      const expectedChallenge = (user as any).webAuthnChallenge;
      if (!expectedChallenge) {
        return res
          .status(400)
          .json(new ResponseStrategy(400, "Challenge no encontrado"));
      }
      // Validar que el flag userVerified esté presente
      /* if (!attestationResponse?.response?.userVerified) {
        return res
          .status(400)
          .json(
            new ResponseStrategy(
              400,
              "El flag userVerified no está presente en la respuesta del dispositivo. El dispositivo o navegador podría no soportar verificación biométrica real."
            )
          );
      } */
      // Validar respuesta de registro
      try {
        const verification = await verifyAttestationResponse({
          response: attestationResponse,
          expectedChallenge,
          expectedOrigin:
            process.env.WEBAUTHN_ORIGIN || "http://localhost:4200",
          expectedRPID: process.env.WEBAUTHN_RPID || "localhost",
        });
        if (!verification.verified) {
          return res
            .status(400)
            .json(new ResponseStrategy(400, "Registro biométrico inválido"));
        }
        // Guardar credencial en el usuario
        const cred = verification.registrationInfo!.credential;
        // Asegurar que user.credentials esté inicializado
        if (!user.credentials) {
          user.credentials = [];
        }
        user.credentials.push({
          credentialID: cred.id,
          publicKey: Buffer.from(cred.publicKey).toString("base64url"),
          counter: cred.counter,
        });
        // Limpiar challenge temporal en la base de datos
        userService
          .updateOneById(user._id, {
            credentials: user.credentials,
            webAuthnChallenge: undefined,
          })
          .subscribe({
            next: () =>
              res.json({
                success: true,
                message: "Credencial registrada correctamente",
              }),
            error: () =>
              res
                .status(500)
                .json(new ResponseStrategy(500, "Error al guardar credencial")),
          });
      } catch (e) {
        console.error(e);
        res
          .status(500)
          .json(new ResponseStrategy(500, "Error al guardar credencial"));
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        new ResponseStrategy(500, "Error al guardar credencial biométrica")
      );
  }
};

// Solicita challenge para login
export const webauthnLoginRequest = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res
        .status(400)
        .json(new ResponseStrategy(400, "Username requerido"));
    }
    userService.getByEmail(username).subscribe(async (user: User | null) => {
      if (!user || !user.credentials || user.credentials.length === 0) {
        return res
          .status(404)
          .json(
            new ResponseStrategy(404, "Usuario o credenciales no encontradas")
          );
      }
      // Generar challenge y opciones de autenticación
      const options = await getAuthenticationOptions({
        allowCredentials: user.credentials.map((c) => ({
          id: c.credentialID, // base64url string
          type: "public-key",
        })),
        userVerification: "preferred",
      });
      // Guardar challenge en la base de datos del usuario (igual que en registro)
      userService
        .updateOneById(user._id, { webAuthnChallenge: options.challenge })
        .subscribe({
          next: () => res.json({ options }),
          error: () =>
            res
              .status(500)
              .json(
                new ResponseStrategy(500, "Error al guardar challenge de login")
              ),
        });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ResponseStrategy(500, "Error en login biométrico"));
  }
};

// Recibe y valida credencial de autenticación
export const webauthnLoginResponse = async (req: Request, res: Response) => {
  try {
    const { username, assertionResponse } = req.body;
    if (!username || !assertionResponse) {
      return res
        .status(400)
        .json(new ResponseStrategy(400, "Datos incompletos"));
    }
    userService.getByEmail(username).subscribe(async (user: User | null) => {
      if (!user || !user.credentials || user.credentials.length === 0) {
        return res
          .status(404)
          .json(
            new ResponseStrategy(404, "Usuario o credenciales no encontradas")
          );
      }
      // Obtener challenge guardado desde la base de datos
      const expectedChallenge = (user as any).webAuthnChallenge;
      if (!expectedChallenge) {
        return res
          .status(400)
          .json(new ResponseStrategy(400, "Challenge no encontrado"));
      }
      // Buscar la credencial usada
      const credID = assertionResponse.rawId;
      const cred = user.credentials.find((c) => c.credentialID === credID);
      if (!cred) {
        return res
          .status(400)
          .json(new ResponseStrategy(400, "Credencial no encontrada"));
      }
      // Validar respuesta de autenticación
      const verification = await verifyAssertionResponse({
        response: assertionResponse,
        expectedChallenge,
        expectedOrigin: process.env.WEBAUTHN_ORIGIN || "http://localhost:4200",
        expectedRPID: process.env.WEBAUTHN_RPID || "localhost",
        credential: {
          id: cred.credentialID, // string base64url
          publicKey: Buffer.from(cred.publicKey, "base64url"),
          counter: cred.counter,
        },
      });
      if (!verification.verified) {
        return res
          .status(400)
          .json(new ResponseStrategy(400, "Login biométrico inválido"));
      }
      // Actualizar el counter de la credencial
      cred.counter = verification.authenticationInfo!.newCounter;
      delete (user as any)._currentChallenge;
      userService
        .updateOneById(user._id, { credentials: user.credentials })
        .subscribe({
          next: () => {
            // Emitir JWT como en login normal
            const token = jwt.sign({ id: user._id }, JWT_SECRET, {
              expiresIn: "6h",
            });
            res.json({
              success: true,
              token,
              message: "Login biométrico exitoso",
            });
          },
          error: () =>
            res
              .status(500)
              .json(new ResponseStrategy(500, "Error al actualizar counter")),
        });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(new ResponseStrategy(500, "Error en autenticación biométrica"));
  }
};
