/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatMarketCap,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchWatchlistIn50DaysLoading,
  watchWatchlistIn50Days,
  watchWatchlistIn50DaysPagination,
  getWatchlistIn50Days,
  resetState
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
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { AIExplain } from '../ai-explain';
import EllipsisText from '../ellipsis-text';
import { Watchlist50DaysFilter } from '../filters/watchlist-50-days.filter';

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
    defaultField: 'AIRating',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchDataWatchList({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const fetchDataWatchList = useCallback(
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
          ...filteredFilter,
          period: filteredFilter?.period ?? '1h'
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  const handleFilter = useCallback(
    (values: Watchlist50DaysFilter) => {
      setFilter((prev) => {
        const newFilter = {
          ...prev,
          ...values
        };
        fetchDataWatchList({ filter: newFilter });
        return newFilter;
      });
    },
    [fetchDataWatchList]
  );

  useEffect(() => {
    fetchDataWatchList();

    return () => {
      dispatch(resetState());
    };
  }, [fetchDataWatchList, dispatch]);

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
      title: t('aiRating'),
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
      title: t('aiRecommendation'),
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
      title: t('aiExplain'),
      dataIndex: 'AIExplain',
      key: 'AIExplain',
      width: 110,
      align: 'center',
      render: (value, record) =>
        value ? (
          <Button
            onClick={() =>
              modal.openModal(<AIExplain symbol={record.symbol} text={value} />)
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
      title: t('previousClose'),
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
      title: t('lowest50'),
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
      title: t('highest50'),
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
      title: t('lowest20'),
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
      title: t('highest20'),
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
      title: t('sma20Days'),
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
      title: t('marketCap'),
      dataIndex: 'marketCap',
      key: 'marketCap',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketCap' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCap')
      }),
      align: 'center',
      render: (value) => (value ? formatMarketCap(value) : '-')
    },
    {
      title: t('industry'),
      dataIndex: 'industry',
      key: 'industry',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'industry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('industry')
      }),
      align: 'left',
      render: (value) => <EllipsisText text={value} maxLines={1} />
    },
    {
      title: t('subIndustry'),
      dataIndex: 'subindustry',
      key: 'subindustry',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'subindustry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('subindustry')
      }),
      align: 'left',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={1} /> : '-'
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      width: 200,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sector' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sector')
      }),
      align: 'left',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={1} /> : '-'
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
      <Watchlist50DaysFilter onFilter={handleFilter} />
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('watchlistIn50DaysTitle')}
        </TableTitle>
        <div css={updatedAtStyles}>
          {watchlistIn50Days.length > 0 && (
            <>
              <strong>{t('updatedAt')}:</strong>&nbsp;
              {dayjs(watchlistIn50Days[0].createdAt)
                .tz(TimeZone.NEW_YORK)
                .format('MMM D, YYYY h:mm A')}
              &nbsp; (New York) -&nbsp;
              <strong>
                {t('period')}: {watchlistIn50Days[0].period}
              </strong>
            </>
          )}
        </div>
      </div>
      <Table<WatchlistIn50Days>
        css={tableStyles}
        rowKey='key'
        columns={columns}
        dataSource={watchlistIn50Days}
        loading={loading}
        scroll={{
          x: 1200,
          y: watchlistIn50Days.length > 0 ? height - 340 : undefined
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
            fetchDataWatchList({ page, pageSize, filter });
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

const updatedAtStyles = css`
  font-size: 1.6rem;
`;
