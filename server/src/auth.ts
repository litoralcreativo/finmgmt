import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { lastValueFrom } from "rxjs";
import { DbManager } from "../bdd/db";
import { UserService } from "./services/user.service";
import bcrypt from "bcrypt";
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

passport.serializeUser((user, done) => {
  done(null, (user as User)._id);
});

passport.deserializeUser((id: string, done) => {
  done(null, id);
});
