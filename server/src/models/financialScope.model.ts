import { ObjectIdType } from "./objectid.model";

export type FinancialScope = {
  _id: ObjectIdType;
  creator: string;
  users: string[];
  icon: string;
  name: string;
  shared: boolean;
  categories: Category[];
};

export type Category = {
  name: string;
  icon: string;
  fixed: boolean;
};

export type FinancialScopeRequestDTO = {
  account_id: string;
  amount: number;
  name: string;
};
