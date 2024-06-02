import validator from "validator";
import bcrypt from "bcrypt";

export class User {
  private id: string;
  public get _id(): string {
    return this.id;
  }
  public set _id(value: any) {
    this.id = value;
  }
  created: number;
  name: { first?: string | null; last?: string | null };
  email: string | null;
  security: { passwordHash: string | null };

  constructor() {
    this.created = Date.now();
    this.name = {
      first: null,
      last: null,
    };
    this.email = null;
    this.security = {
      passwordHash: null,
    };
  }

  setFirstName(firstName: string) {
    try {
      if (firstName) firstName = firstName.trim().replace(/ +/g, " ");
      if (validator.isEmpty(firstName)) throw new Error("firstName is empty");
      if (!validator.isAlphanumeric(firstName))
        throw new Error("firstName must be alphanumeric");

      this.name.first = firstName;
    } catch (error) {
      throw error;
    }
  }

  setLastName(lastName: string) {
    try {
      if (lastName) lastName = lastName.trim().replace(/ +/g, " ");
      if (validator.isEmpty(lastName)) throw new Error("lastName is empty");
      if (!validator.isAlphanumeric(lastName))
        throw new Error("lastName must be alphanumeric");
      this.name.last = lastName;
    } catch (error) {
      throw error;
    }
  }

  setEmail(email: string) {
    try {
      if (email) email = email.trim().replace(/ +/g, " ");
      if (validator.isEmpty(email)) throw new Error("email is empty");
      if (!validator.isEmail(email))
        throw new Error("email doesn't have the correct format");
      this.email = email;
    } catch (error) {
      throw error;
    }
  }

  setPassword(password: string) {
    try {
      if (validator.isEmpty(password)) throw new Error("password is empty");
      if (!validator.isLength(password, { min: 6, max: 12 }))
        throw new Error("password must be 6 to 12 characters long");
      this.security.passwordHash = bcrypt.hashSync(password, 10);
    } catch (error) {
      throw error;
    }
  }
}
