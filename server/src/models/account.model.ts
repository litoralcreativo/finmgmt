import { ObjectIdType } from "./objectid.model";

export type Account = {
  _id: ObjectIdType;
  user_id: string;
  created: Date;
  name: string;
  favorite: boolean;
  type: string;
  symbol: string;
  amount: number;
};

export type AccountRequestDTO = {
  user_id?: string;
  name: string;
  type: string;
  symbol: string;
};
