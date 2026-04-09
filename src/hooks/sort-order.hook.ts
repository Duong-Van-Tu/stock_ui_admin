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
      let newSortField = field;
      let newSortType: SortOrder;

      if (field === sortField) {
        if (sortType === 'descend') {
          newSortType = 'ascend';
        } else if (sortType === 'ascend') {
          newSortField = defaultField;
          newSortType = defaultOrder;
        } else {
          newSortType = 'descend';
        }
      } else {
        newSortType = 'descend';
      }

      setSortField(newSortField);
      setSortType(newSortType);

      const sortFieldMapped = newSortType
        ? (fieldMapping[newSortField] ?? newSortField)
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

      onChange?.(newSortField, newSortType, newFilter as TFilter);
    },
    [sortField, sortType, currentFilter, defaultField, defaultOrder, onChange]
  );

  return {
    sortField,
    sortType,
    handleSortOrder
  };
};
