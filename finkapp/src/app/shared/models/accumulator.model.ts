import { Category } from './category.model';

export interface MonthlyAcumulator {
  year: number;
  month: number;
  total: number;
  groups: AcumulatorGroup[];
};

export interface AcumulatorGroup {
  category: Category;
  amount: number;
  percent?: number;
};
