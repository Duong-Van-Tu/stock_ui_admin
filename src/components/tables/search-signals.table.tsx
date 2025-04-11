/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  calculatePercentage,
  cleanFalsyValues,
  formatMarketCap,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { SocketContext } from '@/providers/socket.provider';
import { getCurrentPrice } from '@/helpers/socket.helper';
import {
  getAlertLogs,
  watchAlertLogsData,
  watchAlertLogsLoading,
  watchAlertLogsPagination
} from '@/redux/slices/signals.slice';
import { DateTimeCell } from './columns/date-time-cell.column';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { AlertLogsView } from '@/constants/common.constant';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useWindowSize } from '@/hooks/useWindowSize';
import { EmptyDataTable } from './empty.table';
import { NotFoundSearchResult } from '../not-found-search-result';
import { searchSymbol } from '@/redux/slices/search';

type SearchSignalTable = {
  symbol: string;
};

export const SearchSignalTable = ({ symbol }: SearchSignalTable) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { height } = useWindowSize();

  const isOption = searchParams.get('isOption')
    ? Number(searchParams.get('isOption'))
    : 0;

  const strategyId = searchParams.get('strategyId')
    ? Number(searchParams.get('strategyId'))
    : undefined;

  const alertLogsData = useAppSelector(watchAlertLogsData);
  const pagination = useAppSelector(watchAlertLogsPagination);
  const loading = useAppSelector(watchAlertLogsLoading);

  const [sortField, setSortField] = useState<string>('entryDate');
  const [sortType, setSortType] = useState<SortOrder>('descend');
  const [filter, setFilter] = useState<AlertLogsFilter>({});

  const handleSortOrder = (field: string) => {
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

    const newFilter = {
      ...filter,
      sortField: newSortType ? fieldMapping[field] ?? field : undefined,
      sortType: newSortType ? convertSortType(newSortType) : undefined
    };

    setFilter((prev) => ({ ...prev, ...newFilter }));

    fetchDataAlertLogs({
      page: PAGINATION.currentPage,
      pageSize: pagination.pageSize,
      filter: newFilter
    });
  };

  const fetchDataAlertLogs = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getAlertLogs({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField],
          sortType: convertSortType(sortType),
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChangeView = useCallback(
    (view: AlertLogsView) => {
      const params = new URLSearchParams(searchParams.toString());

      if (view === AlertLogsView.STOCKS) {
        params.delete('isOption');
      } else {
        params.set('isOption', '1');
      }

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router]
  );

  const handleReload = () => {
    dispatch(searchSymbol(''));
  };

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      symbol,
      isImport: isOption as AlertLogsView,
      strategyId
    }));
    fetchDataAlertLogs({ filter: { symbol, isImport: isOption, strategyId } });

    if (isOption === AlertLogsView.OPTIONS) {
      handleChangeView(AlertLogsView.OPTIONS);
    }
  }, [symbol, isOption, strategyId, fetchDataAlertLogs, handleChangeView]);

  useEffect(() => {
    alertLogsData.forEach((row) => {
      setWatchList(row.symbol);
    });
  }, [alertLogsData, setWatchList]);

  const columns: TableColumnsType<Signal> = [
    {
      title: t('no'),
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
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell
          symbol={record.symbol}
          companyName={record.companyName}
          isNews={record.isNews}
          earningDate={record.earningDate}
          isNewsNegative={record.isNewsNegative}
          // showRecentNewsEarnings={record.recentNewsEarnings}
        />
      )
    },
    {
      title: t('strategy'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 180,
      align: 'center',
      fixed: 'left',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strategyName' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('strategyName')
      })
    },
    {
      title: t('period'),
      dataIndex: 'timeFrame',
      key: 'timeFrame',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'timeFrame' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('timeFrame')
      })
    },
    {
      title: t('entryDate'),
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'entryDate' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('entryDate')
      }),
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('entryPrice'),
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      width: 140,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'entryPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('entryPrice')
      }),
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('exitDate'),
      dataIndex: 'exitDate',
      key: 'exitDate',
      width: 150,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'exitDate' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('exitDate')
      }),
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('exitPrice'),
      dataIndex: 'exitPrice',
      key: 'exitPrice',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'exitPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('exitPrice')
      }),
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <StockChangeCell value={value} percentage={percentage} />
        ) : (
          '-'
        );
      }
    },
    {
      title: t('currentPrice'),
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'currentPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('currentPrice')
      }),
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        const percentage = calculatePercentage(record.entryPrice, price);
        return <StockChangeCell value={price} percentage={percentage} />;
      }
    },
    {
      title: t('highestPrice'),
      dataIndex: 'highestPrice',
      key: 'highestPrice',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPrice')
      }),
      align: 'center',
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return <StockChangeCell value={value} percentage={percentage} />;
      }
    },
    {
      title: t('highestPriceDate'),
      dataIndex: 'highestUpdateAt',
      key: 'highestUpdateAt',
      width: 164,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('lowestPrice'),
      dataIndex: 'lowestPrice',
      key: 'lowestPrice',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowestPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestPrice')
      }),
      align: 'center',
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return <StockChangeCell value={value} percentage={percentage} />;
      }
    },
    {
      title: t('lowestPriceDate'),
      dataIndex: 'lowestUpdateAt',
      key: 'lowestUpdateAt',
      width: 164,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowestUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('marketCap'),
      dataIndex: 'marketCap',
      key: 'marketCap',
      width: 120,
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
      title: t('volume'),
      dataIndex: 'volumeAVG',
      key: 'volumeAVG',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'volumeAVG' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('volumeAVG')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('atr'),
      dataIndex: 'atr',
      key: 'atr',
      width: 100,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value, record) =>
        value ? (
          <StockChangeCell value={value} percentage={record.atrPercent} />
        ) : (
          '-'
        )
    },
    {
      title: t('totalScore'),
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'totalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalScore')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('fundamentalScore'),
      dataIndex: 'fundamentalScore',
      key: 'fundamentalScore',
      width: 170,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'fundamentalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('fundamentalScore')
      }),
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('sentimentScore'),
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sentimentScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentimentScore')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('earningsScore'),
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'earningsScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('earningsScore')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('ytd'),
      dataIndex: 'ytd',
      key: 'ytd',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'ytd' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('ytd')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  return alertLogsData.length === 0 && !loading ? (
    <NotFoundSearchResult
      title={`${t('noSignalsForSymbol')}: "${symbol}"`}
      onReload={handleReload}
    />
  ) : (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('searchResult')} {`"${symbol}"`}
        </TableTitle>
        <Table<Signal>
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={alertLogsData}
          loading={loading}
          scroll={{
            x: 1200,
            y: alertLogsData.length > 0 ? height - 260 : undefined
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
              fetchDataAlertLogs({ page, pageSize, filter });
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
    padding: 0.8rem 1rem !important;
  }
`;

const titleStyles = css`
  padding: 1.2rem 1.6rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
