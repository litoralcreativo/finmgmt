export type PaginationRequest = {
  page: number;
  pageSize: number;
};

export type PaginatedType<T> = PaginationRequest & {
  total: number;
  elements: T[];
};
