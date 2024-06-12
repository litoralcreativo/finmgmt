import { ObjectIdType } from "./objectid.model";

export type FinancialScope = {
  _id: ObjectIdType;
  icon: string;
  name: string;
  creator: string;
  users: string[];
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
