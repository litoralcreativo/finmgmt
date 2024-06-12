import { Category } from './category.model';

export type AccountAcumulator = {
  year: number;
  month: number;
  total: number;
  groups: AccountAcumulatorGroup[];
};

export type AccountAcumulatorGroup = {
  scope: {
    _id: string;
    icon: string;
    name: string;
  };
  category: Category;
  amount: number;
  percent?: number;
};
