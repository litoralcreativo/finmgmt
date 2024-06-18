import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { lastValueFrom } from "rxjs";
import { DbManager } from "./bdd/db";
import { UserService } from "./services/user.service";
import { User } from "./models/user.model";

let userService: UserService;
DbManager.getInstance().subscribe((x) => {
  if (x) userService = new UserService(x);
});

passport.use(
  "local",
  new LocalStrategy(
    { passReqToCallback: true },
    async (req, username, password, done) => {
      // try fetching the user
      const user = await lastValueFrom(userService.getByEmail(username));
      if (!user) return done("Password or username is incorrect", false);

      const result = bcrypt.compareSync(password, user.security.passwordHash!);
      if (!result) return done("Password or username is incorrect", false);

      return done(null, user);
    }
  )
);

const JWT_SECRET = "your_jwt_secret"; // Cambia esto por una clave secreta segura

// Estrategia JWT
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await userService.getById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
