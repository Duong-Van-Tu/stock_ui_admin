/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatNumberShort,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import {
  getOptionChanges,
  resetOptionChanges,
  watchOptionChangesData,
  watchOptionChangesLoading,
  watchOptionChangesPagination
} from '@/redux/slices/options-changes.slice';

export const OptionChangesTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();

  const data = useAppSelector(watchOptionChangesData);
  const pagination = useAppSelector(watchOptionChangesPagination);
  const loading = useAppSelector(watchOptionChangesLoading);

  const [filter, setFilter] = useState<Record<string, any>>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder<
    Record<string, any>
  >({
    defaultField: 'strike',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchData({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const fetchData = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filtered = cleanFalsyValues(filter);
      dispatch(
        getOptionChanges({
          page,
          limit: pageSize,
          sortfield: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          ...filtered
        })
      );
    },
    [dispatch, sortField, sortType]
  );

  useEffect(() => {
    fetchData({});
    return () => {
      dispatch(resetOptionChanges());
    };
  }, [fetchData, dispatch]);

  const baseColumns: TableColumnsType<OptionChange> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 64,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: isMobile ? 100 : 140,
      fixed: 'left'
    },
    {
      title: t('optionType'),
      dataIndex: 'optionType',
      key: 'optionType',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'optionType' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('optionType') }),
      render: (v) => v || '-'
    },
    {
      title: t('expDate'),
      dataIndex: 'expDate',
      key: 'expDate',
      width: 132,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'expDate' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('expDate') }),
      render: (v) => v || '-'
    },
    {
      title: t('dte'),
      dataIndex: 'dte',
      key: 'dte',
      width: 90,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dte' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('dte') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 0) : '-')
    },
    {
      title: t('strike'),
      dataIndex: 'strike',
      key: 'strike',
      width: 110,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strike' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('strike') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('price') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('ask'),
      dataIndex: 'ask',
      key: 'ask',
      width: 100,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('change'),
      dataIndex: 'change',
      key: 'change',
      width: 110,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'change' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('change') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('changePercent'),
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 130,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changePercent' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('changePercent') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 130,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('volume') }),
      render: (v) => (isNumeric(v) ? formatNumberShort(v) : '-')
    },
    {
      title: t('openInt'),
      dataIndex: 'openInt',
      key: 'openInt',
      width: 130,
      align: 'right',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'openInt' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('openInt') }),
      render: (v) => (v ? formatNumberShort(v) : '-')
    },
    {
      title: 'Δ',
      dataIndex: 'delta',
      key: 'delta',
      width: 90,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Θ',
      dataIndex: 'theta',
      key: 'theta',
      width: 90,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Vega',
      dataIndex: 'vega',
      key: 'vega',
      width: 90,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Rho',
      dataIndex: 'rho',
      key: 'rho',
      width: 90,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('costPerContract'),
      dataIndex: 'costPerContract',
      key: 'costPerContract',
      width: 150,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('newStockPrice'),
      dataIndex: 'newStockPrice',
      key: 'newStockPrice',
      width: 140,
      align: 'right',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    }
  ];

  const mobileKeys = [
    'symbol',
    'optionType',
    'expDate',
    'strike',
    'price',
    'volume'
  ];

  const columns: TableColumnsType<OptionChange> = isMobile
    ? baseColumns.filter((c) => mobileKeys.includes(c.key as string))
    : baseColumns;

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles(data.length === 0)}>
          Option Changes
        </TableTitle>
        <Table<OptionChange>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(r) => r.key ?? `${r.symbol}-${r.id}`}
          columns={columns}
          dataSource={data}
          loading={loading}
          showHeader={data.length > 0}
          scroll={{
            x: data.length > 0 ? (isMobile ? 600 : 1400) : undefined,
            y: data.length > 0 ? height - 260 : undefined
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 400)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSizeOptions: [
              '10',
              '20',
              '50',
              '100',
              '200',
              '300',
              '400',
              '500'
            ],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              fetchData({ page, pageSize, filter });
            }
          }}
        />
      </div>
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: ${isMobile
      ? '0.6rem 0.8rem !important'
      : '0.8rem 1rem !important'};
  }
`;

const titleStyles = (isBorderBottom: boolean) => css`
  padding: 1.2rem 1.6rem;
  border-bottom: ${isBorderBottom
    ? '1px solid var(--border-table-color)'
    : 'unset'};
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
