import { Category } from './category.model';

export interface ScopeAcumulator {
  year: number;
  month: number;
  total: number;
  groups: ScopeAcumulatorGroup[];
};

export interface ScopeAcumulatorGroup {
  category: Category;
  amount: number;
  percent?: number;
};
