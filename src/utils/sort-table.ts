export const convertSortType = (type?: 'ascend' | 'descend') => {
  if (type === 'ascend') return 'asc';
  if (type === 'descend') return 'desc';
  return undefined;
};
