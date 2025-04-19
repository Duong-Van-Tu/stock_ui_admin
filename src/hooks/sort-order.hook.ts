import { fieldMapping } from '@/helpers/field-mapping.helper';
import { useState, useCallback } from 'react';

type UseSortOrderParams<TFilter> = {
  defaultField: string;
  defaultOrder?: SortOrder;
  onChange?: (
    newField: string,
    newOrder: SortOrder | undefined,
    newFilter: TFilter
  ) => void;
  currentFilter?: TFilter;
};

export const useSortOrder = <TFilter = any>({
  defaultField,
  defaultOrder = 'descend',
  onChange,
  currentFilter
}: UseSortOrderParams<TFilter>) => {
  const [sortField, setSortField] = useState<string>(defaultField);
  const [sortType, setSortType] = useState<SortOrder>(defaultOrder);

  const handleSortOrder = useCallback(
    (field: string) => {
      let newSortType: SortOrder;

      if (field === sortField) {
        newSortType =
          sortType === 'descend'
            ? 'ascend'
            : sortType === 'ascend'
            ? undefined
            : 'descend';
      } else {
        newSortType = 'descend';
      }

      setSortField(field);
      setSortType(newSortType);

      const sortFieldMapped = newSortType
        ? fieldMapping[field] ?? field
        : undefined;
      const sortTypeMapped = newSortType
        ? newSortType === 'ascend'
          ? 'asc'
          : 'desc'
        : undefined;

      const newFilter = {
        ...currentFilter,
        sortField: sortFieldMapped,
        sortType: sortTypeMapped
      };

      onChange?.(field, newSortType, newFilter as TFilter);
    },
    [sortField, sortType, currentFilter, onChange]
  );

  return {
    sortField,
    sortType,
    handleSortOrder
  };
};
