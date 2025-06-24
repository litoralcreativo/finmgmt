export interface SspPayload<T> {
  paginator: {
    pageSize: number;
    pageIndex: number;
  };
  sort?: {
    direction: 'asc' | 'desc' | '';
    active: string;
  };
  filter?: {
    filterOptions: (keyof T)[];
    filterValue?: string;
  };
};

export interface SspResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  elements: T[];
};
