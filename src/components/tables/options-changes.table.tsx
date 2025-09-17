/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatPercent,
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
import { useSearchParams } from 'next/navigation';
import { SymbolCell } from './columns/symbol-cell.column';
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
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

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
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ?? undefined,
          ...filtered
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
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
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'index' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('index') }),
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 90,
      fixed: 'left',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'symbol' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('symbol') }),
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('optionType'),
      dataIndex: 'optionType',
      key: 'optionType',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'optionType' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('optionType') })
    },
    {
      title: t('messageType'),
      dataIndex: 'messageType',
      key: 'messageType',
      width: 136,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'messageType' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('messageType') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
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
      hidden: true,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('expDate') })
    },
    {
      title: t('dte'),
      dataIndex: 'dte',
      key: 'dte',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dte' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('dte') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
    },
    {
      title: t('strike'),
      dataIndex: 'strike',
      key: 'strike',
      width: 110,
      align: 'center',
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
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('price') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('lastOptionPrice'),
      dataIndex: 'lastOptionPrice',
      key: 'lastOptionPrice',
      width: 120,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lastOptionPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lastOptionPrice')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(Number(v), 2) : v ?? '-')
    },
    {
      title: t('ask'),
      dataIndex: 'ask',
      key: 'ask',
      width: 80,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'ask' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('ask') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('change'),
      dataIndex: 'change',
      key: 'change',
      width: 90,
      align: 'center',
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
      width: 104,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changePercent' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('changePercent') }),
      render: (v) => (isNumeric(v) ? formatPercent(v) : '-')
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('volume') }),
      render: (v) => roundToDecimals(v)
    },
    {
      title: t('openInt'),
      dataIndex: 'openInt',
      key: 'openInt',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'openInt' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('openInt') }),
      render: (v) => roundToDecimals(v)
    },
    {
      title: t('delta'),
      dataIndex: 'delta',
      key: 'delta',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'delta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('delta') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('theta'),
      dataIndex: 'theta',
      key: 'theta',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'theta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('theta') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('vega'),
      dataIndex: 'vega',
      key: 'vega',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'vega' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('vega') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('itmProb'),
      dataIndex: 'itmProb',
      key: 'itmProb',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'itmProb' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('itmProb') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('otmProb'),
      dataIndex: 'otmProb',
      key: 'otmProb',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'otmProb' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('otmProb') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('costPerContract'),
      dataIndex: 'costPerContract',
      key: 'costPerContract',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'costPerContract' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('costPerContract')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('newStockPrice'),
      dataIndex: 'newStockPrice',
      key: 'newStockPrice',
      width: 120,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newStockPrice' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('newStockPrice') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('optionPriceChange'),
      dataIndex: 'optionPriceChange',
      key: 'optionPriceChange',
      width: 170,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'optionPriceChange' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('optionPriceChange')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('newOptionPremium'),
      dataIndex: 'newOptionPremium',
      key: 'newOptionPremium',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionPremium' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionPremium')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('newOptionContract'),
      dataIndex: 'newOptionContract',
      key: 'newOptionContract',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionContract' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionContract')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
    },
    {
      title: t('profitNoTheta'),
      dataIndex: 'profitNoTheta',
      key: 'profitNoTheta',
      width: 146,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitNoTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitNoTheta') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('newOptionPremiumTheta'),
      dataIndex: 'newOptionPremiumTheta',
      key: 'newOptionPremiumTheta',
      width: 138,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionPremiumTheta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionPremiumTheta')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('profitTheta'),
      dataIndex: 'profitTheta',
      key: 'profitTheta',
      width: 124,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitTheta') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('mfpAsk'),
      dataIndex: 'mfpAsk',
      key: 'mfpAsk',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'mfpAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('mfpAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('bidAsk'),
      dataIndex: 'bidAsk',
      key: 'bidAsk',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'bidAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('bidAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    }
  ];

  const mobileKeys = [
    'symbol',
    'optionType',
    'expDate',
    'strike',
    'price',
    'changePercent',
    'volume'
  ];

  const columns: TableColumnsType<OptionChange> = isMobile
    ? baseColumns.filter((c) => mobileKeys.includes(c.key as string))
    : baseColumns;

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles(data.length === 0)}>
          {t('optionChangesTitle')}
        </TableTitle>
        <Table<OptionChange>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={data}
          loading={loading}
          showHeader
          scroll={{
            x: isMobile ? 600 : 1400,
            y: height - 238
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 300)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchData({ page, pageSize, filter })
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
  display: flex;
  flex-direction: column;
`;

const tableStyles = css`
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
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

const emptyStyles = (h: number) => css`
  height: ${h}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
