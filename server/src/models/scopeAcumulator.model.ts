import { Category } from "./financialScope.model";
import { ObjectIdType } from "./objectid.model";

export type ScopeAcumulator = {
  year: number;
  month: number;
  groups: ScopeAcumulatorGroup[];
};

export type ScopeAcumulatorGroup = {
  category: Category;
  amount: number;
};
