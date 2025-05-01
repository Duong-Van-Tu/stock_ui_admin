/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, roundToDecimals } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchWatchlistIn50DaysLoading,
  watchWatchlistIn50Days,
  watchWatchlistIn50DaysPagination,
  getWatchlistIn50Days
} from '@/redux/slices/swing-trading-watchlist.slice';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { useSearchParams } from 'next/navigation';
import { getCurrentPrice } from '@/helpers/socket.helper';
import { SocketContext } from '@/providers/socket.provider';

export const WatchlistIn50DaysTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const { height } = useWindowSize();

  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const watchlistIn50Days = useAppSelector(watchWatchlistIn50Days);
  const pagination = useAppSelector(watchWatchlistIn50DaysPagination);
  const loading = useAppSelector(watchWatchlistIn50DaysLoading);

  const [filter, setFilter] = useState<Filter>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder<Filter>({
    defaultField: 'recommendPercent',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchDataStockScore({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const fetchDataStockScore = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getWatchlistIn50Days({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ? symbol : undefined,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  useEffect(() => {
    fetchDataStockScore();
  }, [fetchDataStockScore]);

  useEffect(() => {
    watchlistIn50Days.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistIn50Days]);

  const columns: TableColumnsType<WatchlistIn50Days> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: 'left',
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('sma50Days'),
      dataIndex: 'sma50',
      key: 'sma50',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sma50' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sma50')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('currentPrice'),
      dataIndex: 'current',
      key: 'current',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'current' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('current')
      }),
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        return price ? roundToDecimals(price) : '-';
      }
    },
    {
      title: t('averagePrice'),
      dataIndex: 'average',
      key: 'average',
      width: 136,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'average' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('average')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('medianPrice'),
      dataIndex: 'median',
      key: 'median',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'median' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('median')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('highestPrice'),
      dataIndex: 'highest',
      key: 'highest',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('lowestPrice'),
      dataIndex: 'lowest',
      key: 'lowest',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowest' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('suggestedHighBuy'),
      dataIndex: 'suggestHighBuy',
      key: 'suggestHighBuy',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'suggestHighBuy' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('suggestHighBuy')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('suggestedLowBuy'),
      dataIndex: 'suggestLowBuy',
      key: 'suggestLowBuy',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'suggestLowBuy' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('suggestLowBuy')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('yahooPriceTargetMean'),
      dataIndex: 'yahooPriceTargetMean',
      key: 'yahooPriceTargetMean',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'yahooPriceTargetMean' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('yahooPriceTargetMean')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('yahooPriceTargetHigh'),
      dataIndex: 'yahooPriceTargetHigh',
      key: 'yahooPriceTargetHigh',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'yahooPriceTargetHigh' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('yahooPriceTargetHigh')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('yahooPriceTargetLow'),
      dataIndex: 'yahooPriceTargetLow',
      key: 'yahooPriceTargetLow',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'yahooPriceTargetLow' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('yahooPriceTargetLow')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('recommendation'),
      dataIndex: 'recommendPercent',
      key: 'recommendPercent',
      width: 156,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'recommendPercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('recommendPercent')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 70} isNegative={value < 40}>
            <span>{roundToDecimals(value, 2)}%</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('buy'),
      dataIndex: 'buy',
      key: 'buy',
      width: 70,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'buy' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('buy')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('strongBuy'),
      dataIndex: 'strongBuy',
      key: 'strongBuy',
      width: 116,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strongBuy' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('strongBuy')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('sell'),
      dataIndex: 'sell',
      key: 'sell',
      width: 70,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sell' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sell')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('strongSell'),
      dataIndex: 'strongSell',
      key: 'strongSell',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strongSell' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('strongSell')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('watchlistIn50DaysTitle')}
        </TableTitle>
      </div>
      <Table<WatchlistIn50Days>
        css={tableStyles}
        rowKey='key'
        columns={columns}
        dataSource={watchlistIn50Days}
        loading={loading}
        scroll={{
          x: 1200,
          y: watchlistIn50Days.length > 0 ? height - 278 : undefined
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
            fetchDataStockScore({ page, pageSize, filter });
          }
        }}
      />
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const titleStyles = css`
  min-width: 30%;
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.2rem 1.4rem;
  gap: 1.4rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
