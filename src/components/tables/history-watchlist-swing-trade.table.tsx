/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Table, TableColumnsType, Tooltip } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, roundToDecimals } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchWatchlistSwingTradeLoading,
  watchWatchlistSwingTradePagination,
  resetState,
  getHistoryWatchlistSwingTrade,
  watchHistoryWatchlistSwingTrade
} from '@/redux/slices/swing-trading-watchlist.slice';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PositiveNegativeText } from '../positive-negative-text';
import { Recommendation } from '@/constants/common.constant';
import { useModal } from '@/hooks/modal.hook';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { AIExplain } from '../ai-explain';
import { isMobile } from 'react-device-detect';
import { Icon } from '../icons';
import { PageURLs } from '@/utils/navigate';
import { HistoryWatchlistSwingTradeFilter } from '../filters/history-watchlist-swing-trade.filter';

export const HistoryWatchlistSwingTradeTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const modal = useModal();
  const router = useRouter();
  const params = useParams();

  const searchParams = useSearchParams();
  const symbol = params?.symbol ?? searchParams.get('symbol');

  const historyWatchlistSwingTrade = useAppSelector(
    watchHistoryWatchlistSwingTrade
  );

  console.log({ historyWatchlistSwingTrade });
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

  const fetchDataWatchList = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit
    }: PageChangeParams = {}) => {
      dispatch(
        getHistoryWatchlistSwingTrade({
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

  const handleGoBack = () => {
    router.push(PageURLs.ofWatchListSwingTrade());
  };

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     dispatch(
  //       autoUpdateWatchlistSwingTrade({
  //         page: pagination.currentPage,
  //         limit: pagination.pageSize,
  //         ...filteredFilter
  //       })
  //     );
  //   }, 60000);

  //   return () => clearInterval(intervalId);
  // }, [dispatch, filteredFilter, pagination.currentPage, pagination.pageSize]);

  const columns: TableColumnsType<HistoryWatchlistSwingTrade> = [
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
      dataIndex: 'aiRating',
      key: 'aiRating',
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
      dataIndex: 'aiRecommendation',
      key: 'aiRecommendation',
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
      dataIndex: 'aiExplain',
      key: 'aiExplain',
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
      title: t('currentPrice'),
      dataIndex: 'current',
      key: 'current',
      width: 130,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'current' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('current')
      }),
      render: (value) => (value ? value.toLocaleString() : '-')
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
      sortOrder: sortField === 'lowest50' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest50')
      }),
      render: (value) => (value ? value.toLocaleString() : '-')
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
      render: (value) => (value ? roundToDecimals(value) : '-')
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
      sortOrder: sortField === 'lowest20' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest20')
      }),
      render: (value) => (value ? roundToDecimals(value) : '-')
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
      sortOrder: sortField === 'lowest10' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest10')
      }),
      render: (value) => (value ? roundToDecimals(value) : '-')
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
      title: t('actions'),
      dataIndex: 'action',
      key: 'action',
      fixed: isMobile ? undefined : 'right',
      align: 'center',
      width: 140,
      render: () => (
        <Button type='primary' ghost onClick={() => {}}>
          {t('viewChart')}
        </Button>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <HistoryWatchlistSwingTradeFilter
        customStyles={filterContainerStyles}
        onFilter={handleFilter}
      />
      <div css={tableContainerStyles}>
        <div css={tableTopStyles}>
          <div css={tableTopRightStyles}>
            <div css={titleBarStyles}>
              <Tooltip title={isMobile ? null : t('back')}>
                <Button
                  shape='circle'
                  type='text'
                  icon={<Icon icon='back' width={18} height={18} />}
                  onClick={handleGoBack}
                />
              </Tooltip>
              <TableTitle customStyles={titleStyles}>
                {t('history')} - {t('watchlistSwingTradeTitle')}
              </TableTitle>
            </div>
            <div css={updatedAtStyles}>
              {historyWatchlistSwingTrade.length > 0 && (
                <>
                  <strong>{t('updatedAt')}:</strong>&nbsp;
                  <span css={dateTextStyles}>
                    {dayjs(historyWatchlistSwingTrade[0].createdAt)
                      .tz(TimeZone.NEW_YORK)
                      .format('MMM D, YYYY h:mm A')}
                  </span>
                  <strong>{t('period')}:</strong>&nbsp;
                  {historyWatchlistSwingTrade[0].period}
                </>
              )}
            </div>
          </div>
        </div>
        <Table<HistoryWatchlistSwingTrade>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey='key'
          columns={columns}
          dataSource={historyWatchlistSwingTrade}
          loading={loading}
          scroll={{
            x: 1200,
            y: historyWatchlistSwingTrade.length > 0 ? height - 340 : undefined
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

const titleBarStyles = css`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: ${isMobile ? '1.2rem' : '1.2rem 1.4rem'};
  gap: 1.4rem;
`;

const tableTopRightStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
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

const dateTextStyles = css`
  margin-right: 0.6rem;
`;

const filterContainerStyles = css`
  padding: ${isMobile && '1.6rem 1.4rem'};
`;
