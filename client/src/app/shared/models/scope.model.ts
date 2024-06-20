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

  getDefaultCategory(): Category {
    if (this.data.categories && this.data.categories.length > 0) {
      const catLengt = this.data?.categories.length;
      return this.data?.categories[catLengt - 1];
    }

    const category: Category = {
      name: 'misc',
      icon: 'more_horiz',
      fixed: false,
    };
    return category;
  }
}

export type ScopeDTO = {
  icon: string;
  name: string;
  shared: boolean;
};
