/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Segmented, Table, TableColumnsType } from 'antd';
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
  resetState,
  autoUpdateWatchlistSwingTrade
} from '@/redux/slices/swing-trading-watchlist.slice';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PositiveNegativeText } from '../positive-negative-text';
import { Recommendation, WatchlistView } from '@/constants/common.constant';
import { useModal } from '@/hooks/modal.hook';
import { StockChangeCell } from './columns/stock-change-cell.column';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { AIExplain } from '../ai-explain';
import EllipsisText from '../ellipsis-text';
import { ExportExcelSwingWatchlist } from '../export-excel-swing-watchlist';
import { isDesktop, isMobile } from 'react-device-detect';
import { startCase } from 'lodash';
import { Icon } from '../icons';
import { PageURLs } from '@/utils/navigate';
import { WatchlistSwingTradeFilter } from '../filters/watchlist-swing-trade.filter';

export const WatchlistSwingTradeTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const modal = useModal();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const isETF = searchParams.get('isETF') ?? undefined;

  const watchlistSwingTrade = useAppSelector(watchWatchlistSwingTrade);
  const pagination = useAppSelector(watchWatchlistSwingTradePagination);
  const loading = useAppSelector(watchWatchlistSwingTradeLoading);

  const [filter, setFilter] = useState<WatchlistSwingTradeFilter>({});

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<WatchlistSwingTradeFilter>({
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

  const filteredFilter = useMemo(() => cleanFalsyValues(filter), [filter]);

  const handleChangeView = useCallback(
    (view: WatchlistView) => {
      const params = new URLSearchParams(searchParams.toString());

      if (view === WatchlistView.STOCKS) {
        params.delete('isETF');
      } else {
        params.set('isETF', 'true');
      }

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router]
  );

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
          symbol: symbol ? symbol : undefined,
          isETF,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol, isETF]
  );

  const handleFilter = useCallback(
    (values: WatchlistSwingTradeFilter) => {
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
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(
        autoUpdateWatchlistSwingTrade({
          page: pagination.currentPage,
          limit: pagination.pageSize,
          ...filteredFilter
        })
      );
    }, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch, filteredFilter, pagination.currentPage, pagination.pageSize]);

  const columns: TableColumnsType<WatchlistSwingTrade> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: !isMobile && 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: isMobile ? 100 : 200,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell
          symbol={record.symbol}
          companyName={
            record.companyName
              ? startCase(record.companyName.toLowerCase())
              : undefined
          }
        />
      )
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
      title: t('lowest50'),
      dataIndex: 'lowest50',
      key: 'lowest50',
      width: 110,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changeLowest50Realtime' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('changeLowest50Realtime')
      }),
      render: (value, record) => {
        return value ? (
          <StockChangeCell
            value={value}
            percentage={
              record.changeLowest50Realtime < 0
                ? record.changeLowest50Realtime
                : -record.changeLowest50Realtime
            }
          />
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
      sortOrder: sortField === 'changeLowest20Realtime' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('changeLowest20Realtime')
      }),
      render: (value, record) => {
        return value ? (
          <StockChangeCell
            value={value}
            percentage={
              record.changeLowest20Realtime < 0
                ? record.changeLowest20Realtime
                : -record.changeLowest20Realtime
            }
          />
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
      title: t('lowest10'),
      dataIndex: 'lowest10',
      key: 'lowest10',
      width: 120,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changeLowest10Realtime' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('changeLowest10Realtime')
      }),
      render: (value, record) => {
        return value ? (
          <StockChangeCell
            value={value}
            percentage={
              record.changeLowest10Realtime < 0
                ? record.changeLowest10Realtime
                : -record.changeLowest10Realtime
            }
          />
        ) : (
          '-'
        );
      }
    },
    {
      title: t('highest10'),
      dataIndex: 'highest10',
      key: 'highest10',
      width: 120,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest10' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest10')
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
      align: 'center',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={1} /> : '-'
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
      align: 'center',
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
      align: 'center',
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
    },
    {
      title: t('actions'),
      dataIndex: 'action',
      key: 'action',
      fixed: isMobile ? undefined : 'right',
      align: 'center',
      width: 124,
      render: (_, record) => (
        <Button
          type='primary'
          ghost
          icon={
            <Icon
              icon='history'
              width={18}
              height={18}
              fill='var(--primary-color)'
            />
          }
          onClick={() =>
            router.push(PageURLs.ofHistoryWatchListSwingTrade(record.symbol))
          }
        >
          {t('history')}
        </Button>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <WatchlistSwingTradeFilter
        customStyles={filterContainerStyles}
        onFilter={handleFilter}
      />
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
          {isDesktop && (
            <Segmented
              css={segmentedStyles}
              options={[
                {
                  label: (
                    <div css={segmentedLabelStyles}>{t('regularStocks')}</div>
                  ),
                  value: WatchlistView.STOCKS
                },
                {
                  label: <div css={segmentedLabelStyles}>{t('etfStocks')}</div>,
                  value: WatchlistView.ETF
                }
              ]}
              defaultValue={isETF ? WatchlistView.ETF : WatchlistView.STOCKS}
              onChange={(value) => handleChangeView(value)}
            />
          )}

          {!isMobile && <ExportExcelSwingWatchlist />}
        </div>
        <Table<WatchlistSwingTrade>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey='key'
          columns={columns}
          dataSource={watchlistSwingTrade}
          loading={loading}
          scroll={{
            x: 1200,
            y: watchlistSwingTrade.length > 0 ? height - 366 : undefined
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
    </div>
  );
};

const rootStyles = css`
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

const recommendationStyles = css`
  text-transform: uppercase;
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

const filterContainerStyles = css`
  padding: ${isMobile && '1.6rem 1.4rem'};
`;

const segmentedStyles = css`
  padding: 0;
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -70%);
  .ant-segmented-item {
    width: 8.8rem;
  }
  .ant-segmented-item-selected {
    background: var(--primary-color);
    color: var(--white-color);
  }
`;

const segmentedLabelStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  font-weight: 500;
`;
