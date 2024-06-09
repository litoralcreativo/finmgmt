import { ObjectIdType } from "./objectid.model";

export type FinancialSpace = {
  _id: ObjectIdType;
  creator: string;
  users: string[];
  icon: string;
  name: string;
  shared: boolean;
  cateogries: Category;
};

export type Category = {
  name: string;
  icon: string;
  fixed: boolean;
};

export type FinancialSpaceRequestDTO = {
  account_id: string;
  amount: number;
  name: string;
};
