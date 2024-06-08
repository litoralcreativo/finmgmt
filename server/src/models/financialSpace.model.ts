import { ObjectIdType } from "./objectid.model";

export type FinancialSpace = {
  _id: ObjectIdType;
  creator: string;
  users: string[];
  name: string;
  shared: boolean;
  cateogries: Category;
};

export type Category = {
  name: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  fixed: string[];
  variable: string[];
};

export type FinancialSpaceRequestDTO = {
  account_id: string;
  amount: number;
  name: string;
};
