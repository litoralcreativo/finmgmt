import { Category } from "./financialScope.model";
import { ObjectIdType } from "./objectid.model";

export type AccountAcumulator = {
  year: number;
  month: number;
  groups: AccountAcumulatorGroup[];
};

export type AccountAcumulatorGroup = {
  scope: {
    _id: ObjectIdType;
    icon: string;
    name: string;
  };
  category: Category;
  amount: number;
};
