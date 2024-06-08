export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export type PaginatedType<T> = PaginationRequest & CountedList<T>;

export type CountedList<T> = {
  total: number;
  elements: T[];
};
