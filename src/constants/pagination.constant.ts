import { isMobile } from 'react-device-detect';

export const PAGINATION = {
  total: 0,
  currentPage: 1,
  pageSize: isMobile ? 20 : 100
};

export const PAGINATION_PARAMS = {
  offset: 1,
  limit: isMobile ? 20 : 100,
  unLimit: 999999
};
