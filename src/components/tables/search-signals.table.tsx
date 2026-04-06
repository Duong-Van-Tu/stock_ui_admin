/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  calculatePercentage,
  cleanFalsyValues,
  formatMarketCap,
  formatNumberShort,
  isNumeric,
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
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import EllipsisText from '../ellipsis-text';
import {
  Recommendation,
  RecommendationText
} from '@/constants/common.constant';
import { useModal } from '@/hooks/modal.hook';
import { AIExplain } from '../ai-explain';
import { regex } from '@/utils/regex';
import { usePathname } from 'next/navigation';

type SearchSignalTable = {
  symbol: string;
  showTitle?: boolean;
};

export const SearchSignalTable = ({
  symbol,
  showTitle = true
}: SearchSignalTable) => {
  const t = useTranslations();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const { height } = useWindowSize();
  const modal = useModal();

  const alertLogsData = useAppSelector(watchAlertLogsData);
  const pagination = useAppSelector(watchAlertLogsPagination);
  const loading = useAppSelector(watchAlertLogsLoading);

  const [filter, setFilter] = useState<AlertLogsFilter>({});

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<AlertLogsFilter>({
      defaultField: 'entryDate',
      defaultOrder: 'descend',
      currentFilter: filter,
      onChange: (_field, _order, newFilter) => {
        setFilter(newFilter);
        fetchDataAlertLogs({
          page: PAGINATION.currentPage,
          pageSize: pagination.pageSize,
          filter: newFilter
        });
      }
    });

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
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol,
          isSymbolSpecific: !!regex.stockDetailPath.test(pathname),
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  useEffect(() => {
    fetchDataAlertLogs({});
  }, [fetchDataAlertLogs]);

  useEffect(() => {
    alertLogsData.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertLogsData]);

  const baseColumns: TableColumnsType<Signal> = [
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
      width: isMobile ? 100 : 160,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell
          symbol={record.symbol}
          companyName={isMobile ? undefined : record.companyName}
          isNews={record.isNews}
          earningDate={record.earningDate}
          isNewsNegative={record.isNewsNegative}
        />
      )
    },
    {
      title: t('strategy'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 160,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strategyName' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('strategyName')
      }),
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
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
      title: t('realCandleEntry'),
      dataIndex: 'realCandleEntry',
      key: 'realCandleEntry',
      width: 156,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'realCandleEntry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('realCandleEntry')
      }),
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('expectCandleEntry'),
      dataIndex: 'expectCandleEntry',
      key: 'expectCandleEntry',
      width: 174,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'expectCandleEntry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('expectCandleEntry')
      }),
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
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
      dataIndex: 'AIRecommendationSignal',
      key: 'AIRecommendationSignal',
      width: 180,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'AIRecommendationSignal' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('AIRecommendationSignal')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText
            isPositive={value === Recommendation.BUY}
            isNegative={value === Recommendation.SELL}
          >
            <span css={recommendationStyles}>{RecommendationText[value]}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('manualRecommendation'),
      dataIndex: 'manualRecommendation',
      key: 'manualRecommendation',
      width: 160,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'manualRecommendation' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('manualRecommendation')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText
            isPositive={
              value === Recommendation.BUY ||
              value === Recommendation.STRONG_BUY ||
              value === Recommendation.sBuyE ||
              value === Recommendation.sBuyBS
            }
            isNegative={value === Recommendation.SELL}
          >
            <span css={recommendationStyles}>{RecommendationText[value]}</span>
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
      title: t('takeProfit'),
      dataIndex: 'takeProfit',
      key: 'takeProfit',
      width: 116,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'takeProfit' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('takeProfit')
      }),
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('stopLoss'),
      dataIndex: 'stopLoss',
      key: 'stopLoss',
      width: 114,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'stopLoss' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('stopLoss')
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
      sortOrder: sortField === 'plPercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('plPercent')
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
      title: t('highestPrice3Days'),
      dataIndex: 'highestPrice3Days',
      key: 'highestPrice3Days',
      width: 136,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestPrice3Days' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPrice3Days')
      }),
      align: 'center',
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <StockChangeCell value={value} percentage={percentage} />
        ) : (
          '-     '
        );
      }
    },
    {
      title: t('highest3DaysUpdateAt'),
      dataIndex: 'highest3DaysUpdateAt',
      key: 'highest3DaysUpdateAt',
      width: 164,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest3DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest3DaysUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('highestPrice7Days'),
      dataIndex: 'highestPrice7Days',
      key: 'highestPrice7Days',
      width: 136,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestPrice7Days' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPrice7Days')
      }),
      align: 'center',
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <StockChangeCell value={value} percentage={percentage} />
        ) : (
          '-     '
        );
      }
    },
    {
      title: t('highest7DaysUpdateAt'),
      dataIndex: 'highest7DaysUpdateAt',
      key: 'highest7DaysUpdateAt',
      width: 164,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest7DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest7DaysUpdateAt')
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
      title: t('lowestPrice3Days'),
      dataIndex: 'lowestPrice3Days',
      key: 'lowestPrice3Days',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowestPrice3Days' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestPrice3Days')
      }),
      align: 'center',
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
      title: t('lowest3DaysUpdateAt'),
      dataIndex: 'lowest3DaysUpdateAt',
      key: 'lowest3DaysUpdateAt',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowest3DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest3DaysUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('lowestPrice7Days'),
      dataIndex: 'lowestPrice7Days',
      key: 'lowestPrice7Days',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowestPrice7Days' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestPrice7Days')
      }),
      align: 'center',
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
      title: t('lowest7DaysUpdateAt'),
      dataIndex: 'lowest7DaysUpdateAt',
      key: 'lowest7DaysUpdateAt',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowest7DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest7DaysUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('earningsNext3Days'),
      dataIndex: 'earningDate3days',
      key: 'earningDate3days',
      width: 136,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'earningDate3days' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('earningDate3days')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={!!value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
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
      render: (value) => (value ? formatNumberShort(value) : '-')
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
        isNumeric(value) ? (
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
        isNumeric(value) ? (
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
        isNumeric(value) ? (
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
        isNumeric(value) ? (
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
    },
    {
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: isMobile ? 84 : 90,
      align: 'center',
      fixed: isMobile ? undefined : 'right',
      render: (_, record) =>
        record.plPercent ? (
          <PositiveNegativeText
            isPositive={record.plPercent >= 0}
            isNegative={record.plPercent < 0}
          >
            {record.plPercent >= 0 ? (
              <span>{t('win')}</span>
            ) : (
              <span>{t('loss')}</span>
            )}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  const mobileColumnKeys = [
    'symbol',
    'strategyName',
    'timeFrame',
    'AIRecommendationSignal',
    'manualRecommendation',
    'entryDate',
    'entryPrice',
    'stopLoss',
    'takeProfit',
    'exitDate',
    'exitPrice',
    'currentPrice',
    'action'
  ];

  const columns: TableColumnsType<Signal> = isMobile
    ? baseColumns.filter((col) => mobileColumnKeys.includes(col.key as string))
    : baseColumns;

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        {showTitle && (
          <TableTitle customStyles={titleStyles(alertLogsData.length === 0)}>
            {t('searchResult')} {`"${symbol}"`}
          </TableTitle>
        )}
        <Table<Signal>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={alertLogsData}
          loading={loading}
          showHeader={alertLogsData.length > 0}
          scroll={{
            x: alertLogsData.length > 0 ? (isMobile ? 400 : 1200) : undefined,
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

const recommendationStyles = css`
  text-transform: uppercase;
`;
