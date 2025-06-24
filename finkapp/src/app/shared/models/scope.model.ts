import { Category } from './category.model';

export interface ScopeResponse {
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
    if (this.data.categories) {
      this.data.categories.sort(
        (a, b) => Number(a.default ?? false) - Number(b.default ?? false)
      );
    }
  }

  getCategories(): Category[] {
    return this.data?.categories ?? [];
  }

  getDefaultCategory(): Category | undefined {
    return this.data.categories.find((x) => x.default);
  }
}

export interface ScopeDTO {
  icon: string;
  name: string;
  shared: boolean;
};

export interface ScopedCategory {
  _id: string;
  name: string;
  icon: string;
  category: Category;
};
