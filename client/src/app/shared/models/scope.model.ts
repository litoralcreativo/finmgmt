import { Category } from './category.model';

export type ScopeResponse = {
  _id: string;
  cerator: string;
  users: string[];
  icon: string;
  name: string;
  shared: boolean;
  categories: Category[];
};

export class Scope {
  data: ScopeResponse;

  constructor(init: ScopeResponse) {
    this.data = init;
  }

  getCategories(): Category[] {
    return this.data?.categories ?? [];
  }
}
