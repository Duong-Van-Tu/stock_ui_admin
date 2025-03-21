type Pagination = {
  currentPage: number;
  pageSize: number;
  total: number;
};

type PaginationParams = {
  offset: number;
  limit: number;
};

type PageChangeParams = {
  page?: number;
  pageSize?: number;
  filter?: any;
  sort?: string;
};
