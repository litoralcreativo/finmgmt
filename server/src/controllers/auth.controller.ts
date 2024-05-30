import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { DbManager } from "../../bdd/db";
import { ResponseStrategy } from "../models/response.model";
import { User } from "../models/user.model";
import { UserService } from "../services/user.service";

let userService: UserService;
DbManager.getInstance().subscribe((x) => {
  if (x) userService = new UserService(x);
});

export const localAuthRegistration = (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = new User();
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setEmail(email);
    user.setPassword(password);

    userService.createOne(user).subscribe((val: any) => {
      res
        .status(200)
        .json({ ...new ResponseStrategy(200, "Successfuly registered"), user });
    });
  } catch (e: any) {
    res.status(400).json({ ...new ResponseStrategy(400, e.message) });
  }
};

export const localAuthLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    passport.authenticate("local", (err: any, user: User) => {
      if (err) {
        return res.status(401).json({
          ...new ResponseStrategy(401, err),
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next();
        }
        res
          .status(200)
          .json({ ...new ResponseStrategy(200, "Logged in successfully") });
      });
    })(req, res, next);
  } catch (e) {
    throw e;
  }
};

export const localAuthLogout = (req: Request, res: Response) => {
  try {
    res.status(200).json({
      timestamp: Date.now(),
      msg: "Logged out successfully",
      code: 200,
    });
  } catch (e) {
    throw e;
  }
};
