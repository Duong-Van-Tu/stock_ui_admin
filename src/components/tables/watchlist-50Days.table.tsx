/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, roundToDecimals } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchWatchlistIn50DaysLoading,
  watchWatchlistIn50Days,
  watchWatchlistIn50DaysPagination,
  getWatchlistIn50Days
} from '@/redux/slices/swing-trading-watchlist.slice';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { useSearchParams } from 'next/navigation';
import { PositiveNegativeText } from '../positive-negative-text';
import { Recommendation } from '@/constants/common.constant';
import { useModal } from '@/hooks/modal.hook';
import { StockChangeCell } from './columns/stock-change-cell.column';

export const WatchlistIn50DaysTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const modal = useModal();

  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const watchlistIn50Days = useAppSelector(watchWatchlistIn50Days);
  const pagination = useAppSelector(watchWatchlistIn50DaysPagination);
  const loading = useAppSelector(watchWatchlistIn50DaysLoading);

  const [filter, setFilter] = useState<Filter>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder<Filter>({
    defaultField: 'AIRecommendation',
    defaultOrder: 'ascend',
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
      title: t('period'),
      dataIndex: 'period',
      key: 'period',
      width: 80,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'period' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('period')
      }),
      align: 'center'
    },
    {
      title: 'AI Rating',
      dataIndex: 'AIRating',
      key: 'AIRating',
      width: 100,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'AIRating' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('AIRating')
      }),
      align: 'center'
    },
    {
      title: 'AI Recommendation',
      dataIndex: 'AIRecommendation',
      key: 'AIRecommendation',
      width: 180,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'AIRecommendation' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('AIRecommendation')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText
            isPositive={value === Recommendation.BUY}
            isNegative={value === Recommendation.SELL}
          >
            <span css={recommendationStyles}>{value}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: 'AI Explain',
      dataIndex: 'AIExplain',
      key: 'AIExplain',
      width: 110,
      align: 'center',
      render: (value) =>
        value ? (
          <Button
            onClick={() =>
              modal.openModal(
                <div css={AIExplainStyles}>
                  <h3>AI Explain</h3>
                  <p>{value}</p>
                </div>
              )
            }
            type='link'
            block
          >
            {t('viewDetails')}
          </Button>
        ) : (
          '-'
        )
    },
    {
      title: 'Previous Close',
      dataIndex: 'previousClose',
      key: 'previousClose',
      width: 140,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'previousClose' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('previousClose')
      }),
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: 'Lowest 50',
      dataIndex: 'lowest50',
      key: 'lowest50',
      width: 110,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changeLowest50' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('changeLowest50')
      }),
      render: (value, record) => {
        return value ? (
          <StockChangeCell value={value} percentage={-record.changeLowest50} />
        ) : (
          '-'
        );
      }
    },
    {
      title: 'Highest 50',
      dataIndex: 'highest50',
      key: 'highest50',
      width: 120,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest50' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest50')
      }),
      render: (value) => {
        return value ? roundToDecimals(value) : '-';
      }
    },
    {
      title: 'Lowest 20',
      dataIndex: 'lowest20',
      key: 'lowest20',
      width: 110,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changeLowest20' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('changeLowest20')
      }),
      render: (value, record) => {
        return value ? (
          <StockChangeCell value={value} percentage={-record.changeLowest20} />
        ) : (
          '-'
        );
      }
    },
    {
      title: 'Highest 20',
      dataIndex: 'highest20',
      key: 'highest20',
      width: 120,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest20' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest20')
      }),
      render: (value) => {
        return value ? roundToDecimals(value) : '-';
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
      title: 'SMA 20 Days',
      dataIndex: 'sma20',
      key: 'sma20',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sma20' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sma20')
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

const recommendationStyles = css`
  text-transform: uppercase;
`;

const AIExplainStyles = css`
  h3 {
    text-align: center;
    font-weight: 600;
    font-size: 2.2rem;
  }
  p {
    margin-bottom: 0;
  }
`;
