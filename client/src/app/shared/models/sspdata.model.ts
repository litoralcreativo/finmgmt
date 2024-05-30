export type SSPPAYLOAD<T> = {
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

export type SSPRESPONSE<T> = {
  total: number;
  page: number;
  pageSize: number;
  elements: T[];
};
