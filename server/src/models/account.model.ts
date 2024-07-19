import { BSON } from "mongodb";
import { ObjectIdType } from "./objectid.model";

export type Account = BSON.Document & {
  user_id: string;
  created: Date;
  name: string;
  favorite: boolean;
  type: string;
  symbol: string;
  amount: number;
  shared_with?: string[];
};

export type AccountRequestDTO = {
  user_id?: string;
  name: string;
  type: string;
  symbol: string;
};
