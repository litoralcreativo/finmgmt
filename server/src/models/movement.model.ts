import { ObjectIdType } from "./objectid.model";

export type Movement = {
  _id: ObjectIdType;
  user_id: string;
  categoria_id: string;
  amount: number;
  date: string;
  descripcion: string;
};

export type MovementRequestDTO = {
  amount: number;
  descripcion: string;
};
