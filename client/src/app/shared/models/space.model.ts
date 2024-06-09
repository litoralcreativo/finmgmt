import { Category } from './category.model';

export type SpaceResponse = {
  _id: string;
  cerator: string;
  users: string[];
  icon: string;
  name: string;
  shared: boolean;
  categories: Category[];
};

export class Space {
  data: SpaceResponse;

  constructor(init: SpaceResponse) {
    this.data = init;
  }

  getCategories(): Category[] {
    return this.data?.categories ?? [];
  }
}
