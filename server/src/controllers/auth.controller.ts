import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { DbManager } from "../bdd/db";
import { ResponseStrategy } from "../models/response.model";
import { User } from "../models/user.model";
import { UserService } from "../services/user.service";
import jwt from "jsonwebtoken";

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
