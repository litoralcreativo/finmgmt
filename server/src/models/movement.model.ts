import { ObjectIdType } from "./objectid.model";

export type Movement = {
  _id: ObjectIdType;
  user_id: string;
  account_id: string;
  amount: number;
  date: string;
  descripcion: string;
};

export type MovementRequestDTO = {
  account_id: string;
  amount: number;
  descripcion: string;
};
