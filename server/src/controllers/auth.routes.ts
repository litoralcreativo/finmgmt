import express from "express";
import passport from "passport";
import {
  localAuthLogin,
  localAuthLogout,
  localAuthRegistration,
} from "./auth.controller";

const router = express.Router();

/* router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
); */

router.post("/register", localAuthRegistration);
router.post("/login", localAuthLogin);
router.post("/logout", localAuthLogout);

export { router };
