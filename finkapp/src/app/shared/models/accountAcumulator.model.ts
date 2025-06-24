import { Category } from './category.model';

export interface AccountAcumulator {
  year: number;
  month: number;
  total: number;
  groups: AccountAcumulatorGroup[];
};

export interface AccountAcumulatorGroup {
  scope: {
    _id: string;
    icon: string;
    name: string;
  };
  category: Category;
  amount: number;
  percent?: number;
};
