import { isMobile } from 'react-device-detect';

export const PAGINATION = {
  total: 0,
  currentPage: 1,
  pageSize: 10
};

export const PAGINATION_PARAMS = {
  offset: 1,
  limit: isMobile ? 30 : 100,
  unLimit: 999999
};
