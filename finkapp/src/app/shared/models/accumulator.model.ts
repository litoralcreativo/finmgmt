import { Category } from './category.model';

export type MonthlyAcumulator = {
  year: number;
  month: number;
  total: number;
  groups: AcumulatorGroup[];
};

export type AcumulatorGroup = {
  category: Category;
  amount: number;
  percent?: number;
};
