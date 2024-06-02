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

export const registration = (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const newUser = new User();
    newUser.setFirstName(firstName);
    newUser.setLastName(lastName);
    newUser.setEmail(email);
    newUser.setPassword(password);

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
        res.status(200).json({ redirectTo: "/dashboard" });
      });
    })(req, res, next);
  } catch (e) {
    throw e;
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.logout((err) => {
      if (err) {
        next(err);
      }
      req.session.destroy((err) => {
        if (err) {
          next(err);
        }
        res.clearCookie("app-auth");
        res.status(200).json({
          timestamp: Date.now(),
          msg: "Logged out successfully",
          code: 200,
        });
      });
    });
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

export const checkIsAuth = (req: Request, res: Response) => {
  try {
    res.status(200).json({
      ...new ResponseStrategy(200, "OK"),
      isAuth: req.isAuthenticated(),
    });
    req.isAuthenticated();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ...new ResponseStrategy(500, "Fail to get user, internal server error"),
    });
  }
};
