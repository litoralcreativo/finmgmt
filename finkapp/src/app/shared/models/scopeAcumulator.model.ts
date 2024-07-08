import { Category } from './category.model';

export type ScopeAcumulator = {
  year: number;
  month: number;
  total: number;
  groups: ScopeAcumulatorGroup[];
};

export type ScopeAcumulatorGroup = {
  category: Category;
  amount: number;
  percent?: number;
};
