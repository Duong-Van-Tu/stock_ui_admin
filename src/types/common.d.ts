type SortOrder = 'ascend' | 'descend' | undefined;

type Filter = {
  symbol?: string;
  sortField?: string;
  sortType?: string;
  page?: number;
  limit?: number;
};
