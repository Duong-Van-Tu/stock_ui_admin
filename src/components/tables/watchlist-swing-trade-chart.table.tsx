/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatMarketCap,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchWatchlistSwingTradeLoading,
  watchWatchlistSwingTrade,
  watchWatchlistSwingTradePagination,
  getWatchlistSwingTrade,
  resetState
} from '@/redux/slices/swing-trading-watchlist.slice';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { PositiveNegativeText } from '../positive-negative-text';
import { Recommendation } from '@/constants/common.constant';
import { useModal } from '@/hooks/modal.hook';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { AIExplain } from '../ai-explain';
import { isMobile } from 'react-device-detect';
import StockOverviewChart from '../charts/stock-overview.chart';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import { Icon } from '../icons';

export const WatchlistSwingTradeChartTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const modal = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const watchlistSwingTrade = useAppSelector(watchWatchlistSwingTrade);
  const pagination = useAppSelector(watchWatchlistSwingTradePagination);
  const loading = useAppSelector(watchWatchlistSwingTradeLoading);

  const [filter, setFilter] = useState<WatchlistSwingTradeFilter>({});

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<WatchlistSwingTradeFilter>({
      defaultField: 'marketCapWatchList',
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

  const highlightedSymbol = useMemo(() => {
    if (!symbol) return watchlistSwingTrade[0]?.symbol;
    return symbol;
  }, [watchlistSwingTrade, symbol]);

  const fetchDataWatchList = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getWatchlistSwingTrade({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          period: '1day',
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    fetchDataWatchList({});
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, fetchDataWatchList]);

  const columns: TableColumnsType<WatchlistSwingTrade> = [
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 80,
      fixed: 'left',
      render: (value, record) => (
        <span
          css={symbolStyles}
          onClick={() =>
            router.push(
              `${PageURLs.ofWatchListSwingTradeChart()}?symbol=${value}`
            )
          }
        >
          {value}
          <Icon
            customStyles={buyIconStyles}
            icon={
              record.AIRecommendation === Recommendation.BUY
                ? 'buy'
                : record.AIRecommendation === Recommendation.SELL
                ? 'sell'
                : 'hold'
            }
            width={16}
            height={16}
          />
        </span>
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
      title: t('currentPrice'),
      dataIndex: 'currentPriceWatchlist',
      key: 'currentPriceWatchlist',
      width: 130,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'currentPriceWatchlist' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('currentPriceWatchlist')
      }),
      render: (value, record) => {
        value
          ? roundToDecimals(value)
          : record.previousClose
          ? roundToDecimals(record.previousClose)
          : null;

        return !!value ? (
          <span
            css={currentPriceStyles(
              value <= record.lowest20,
              value > record.lowest20 && record.changeLowest20Realtime <= 2
            )}
          >
            {value} <br />
            <PositiveNegativeText
              isNegative={value < record.previousClose}
              isPositive={value >= record.previousClose}
            >
              (<span>{value >= record.previousClose ? '+' : ''}</span>
              {(
                ((value - record.previousClose) / record.previousClose) *
                100
              ).toLocaleString()}
              %)
            </PositiveNegativeText>
          </span>
        ) : (
          '-'
        );
      }
    },
    {
      title: t('marketCap'),
      dataIndex: 'marketCapWatchList',
      key: 'marketCapWatchList',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketCapWatchList' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCapWatchList')
      }),
      align: 'center',
      render: (value) => (value ? formatMarketCap(value / 1000000) : '-')
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
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={chartWrapperStyles}>
        <StockOverviewChart
          symbol={symbol ? symbol : watchlistSwingTrade[0]?.symbol}
        />
      </div>

      <div css={tableWrapperStyles}>
        <div css={tableContainerStyles}>
          <div css={tableTopStyles}>
            <div css={tableTopRightStyles}>
              <TableTitle customStyles={titleStyles}>
                {t('watchlistSwingTradeTitle')}
              </TableTitle>
              <div css={updatedAtStyles}>
                {watchlistSwingTrade.length > 0 && (
                  <>
                    <strong>{t('updatedAt')}:</strong>&nbsp;
                    <span css={dateTextStyles}>
                      {dayjs(watchlistSwingTrade[0].createdAt)
                        .tz(TimeZone.NEW_YORK)
                        .format('MMM D, YYYY h:mm A')}
                    </span>
                    <strong>{t('period')}:</strong>&nbsp;
                    {watchlistSwingTrade[0].period}
                  </>
                )}
              </div>
            </div>
          </div>
          <Table<WatchlistSwingTrade>
            rowClassName={(record) =>
              record.symbol === highlightedSymbol ? 'hl-watchList-symbol' : ''
            }
            size={isMobile ? 'small' : 'middle'}
            css={tableStyles}
            rowKey='key'
            columns={columns}
            dataSource={watchlistSwingTrade}
            loading={loading}
            scroll={{
              x: 800,
              y: watchlistSwingTrade.length > 0 ? height - 266 : undefined
            }}
            sortDirections={['descend', 'ascend']}
            locale={{
              emptyText: (
                <div css={emptyStyles(height - 250)}>
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
              showQuickJumper: false,
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                fetchDataWatchList({ page, pageSize, filter });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const rootStyles = css`
  display: flex;
  gap: 1.6rem;
`;

const chartWrapperStyles = css`
  flex: 1;
`;

const tableWrapperStyles = css`
  max-width: 46rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;
const tableContainerStyles = css`
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
  padding: ${isMobile ? '1.2rem' : '1.2rem 1.4rem'};
  gap: 1.4rem;
  position: relative;
`;

const tableTopRightStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const updatedAtStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
`;

const currentPriceStyles = (isGreen: boolean, isYellow: boolean) => css`
  color: ${isGreen
    ? 'var(--positive-color)'
    : isYellow
    ? 'var(--yellow-color)'
    : 'var(--text-color)'};
  font-weight: ${isYellow || isYellow ? '500' : '400'};
`;

const dateTextStyles = css`
  margin-right: 0.6rem;
`;

const symbolStyles = css`
  font-weight: 600;
  color: var(--symbol-color);
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  cursor: pointer;
  position: relative;
  &:hover {
    color: var(--primary-color);
  }
`;

const buyIconStyles = css`
  position: absolute;
  top: -0.4rem;
  right: -2rem;
`;
