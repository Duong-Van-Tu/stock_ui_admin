/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Key, useCallback, useContext, useEffect, useState } from 'react';
import {
  Button,
  Segmented,
  Space,
  Table,
  TableColumnsType,
  Tooltip
} from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  calculatePercentage,
  cleanFalsyValues,
  formatMarketCap,
  formatNumberShort,
  formatPercent,
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
  resetState,
  watchAlertLogsData,
  watchAlertLogsLoading,
  watchAlertLogsPagination
} from '@/redux/slices/signals.slice';
import { DateTimeCell } from './columns/date-time-cell.column';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { AlertLogsFilter } from '../filters/alert-logs.filter';
import {
  AlertLogsView,
  Recommendation,
  RecommendationText
} from '@/constants/common.constant';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { ExportExcelLog } from '../export-excel-signals';
import { Icon } from '../icons';
import { useModal } from '@/hooks/modal.hook';
import { NotesSignal } from '../forms/note-signal.form';
import { ExitSignal } from '../forms/exit-signal.form';
import { TableRowSelection } from 'antd/es/table/interface';
import { AIExplain } from '../ai-explain';
import { SignalInformation } from '../signal-information';
import { isDesktop, isMobile } from 'react-device-detect';
import { watchSideBarCollapsed } from '@/redux/slices/app.slice';
import EllipsisText from '../ellipsis-text';
import { DownloadSymbolTemplateButton } from '../download-symbol-template';
import { ImportSymbolButton } from '../import-symbol-template';

export const AlertLogsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { height, width } = useWindowSize();
  const modal = useModal();
  const sideBarCollapsed = useAppSelector(watchSideBarCollapsed);

  const isOption = searchParams.get('isOption')
    ? Number(searchParams.get('isOption'))
    : 0;

  const strategyId = searchParams.get('strategyId')
    ? Number(searchParams.get('strategyId'))
    : undefined;

  const symbol = searchParams.get('symbol');
  const alertLogsData = useAppSelector(watchAlertLogsData);
  const pagination = useAppSelector(watchAlertLogsPagination);
  const loading = useAppSelector(watchAlertLogsLoading);

  const [filter, setFilter] = useState<AlertLogsFilter>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const onSelectChange = (_selectedRowKeys: Key[], selectedRows: Signal[]) => {
    const alertLogIds = new Set(selectedRows.map((row) => row.hashAlertLogId));
    setSelectedIds(alertLogIds);
  };

  const rowSelection: TableRowSelection<Signal> = {
    selectedRowKeys: alertLogsData
      .filter(({ hashAlertLogId }) => selectedIds.has(hashAlertLogId))
      .map(({ key }) => key),

    onChange: onSelectChange,

    getCheckboxProps: (record) => ({
      disabled: !!record.exitDate
    })
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
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ?? undefined,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  const handleFilter = (values: AlertLogsFilter) => {
    const newFilter = {
      ...filter,
      ...values
    };
    setFilter(newFilter);
    fetchDataAlertLogs({ filter: newFilter });
  };

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

  const handleRefresh = useCallback(() => {
    fetchDataAlertLogs({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      filter
    });
  }, [fetchDataAlertLogs, pagination.currentPage, pagination.pageSize, filter]);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      isImport: isOption as AlertLogsView,
      strategyId
    }));
    fetchDataAlertLogs({ filter: { isImport: isOption, strategyId } });

    if (isOption === AlertLogsView.OPTIONS) {
      handleChangeView(AlertLogsView.OPTIONS);
    }
  }, [isOption, strategyId, fetchDataAlertLogs, handleChangeView, dispatch]);

  useEffect(() => {
    alertLogsData.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertLogsData]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

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
          signalId={record.id}
          stockInfo={record.stockInfo}
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
              value === Recommendation.STRONG_BUY
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
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <div>
            {roundToDecimals(value, 2)}
            <br />
            <PositiveNegativeText
              isPositive={percentage > 0}
              isNegative={percentage < 0}
            >
              <span>({formatPercent(percentage, 2)})</span>
            </PositiveNegativeText>
          </div>
        ) : (
          '-'
        );
      }
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
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <div>
            {roundToDecimals(value, 2)}
            <br />
            <PositiveNegativeText
              isPositive={percentage > 0}
              isNegative={percentage < 0}
            >
              <span>({formatPercent(percentage, 2)})</span>
            </PositiveNegativeText>
          </div>
        ) : (
          '-'
        );
      }
    },
    {
      title: t('newStopLoss'),
      dataIndex: 'newStopLoss',
      key: 'newStopLoss',
      width: 124,
      align: 'center',
      render: (value, record) => {
        const percentage = calculatePercentage(record.entryPrice, value);
        return value ? (
          <div>
            {roundToDecimals(value, 2)}
            <br />
            <PositiveNegativeText
              isPositive={percentage > 0}
              isNegative={percentage < 0}
            >
              <span>({formatPercent(percentage, 2)})</span>
            </PositiveNegativeText>
          </div>
        ) : (
          '-'
        );
      }
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
      title: t('rsi'),
      dataIndex: 'rsi',
      key: 'rsi',
      width: 80,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'rsi' ? sortType : null,
      hidden: true,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('rsi')
      }),
      render: (value) => value ?? '-'
    },
    {
      title: t('currentPrice'),
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'currentPricePercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('currentPricePercent')
      }),
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        return (
          <StockChangeCell
            value={price}
            percentage={record.currentPricePercent}
          />
        );
      }
    },
    {
      title: t('highestPrice'),
      dataIndex: 'highestPrice',
      key: 'highestPrice',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestPricePercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPricePercent')
      }),
      align: 'center',
      render: (value, record) => {
        return (
          <StockChangeCell
            value={value}
            percentage={record.highestPricePercent}
          />
        );
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
          '-'
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
      sortOrder: sortField === 'lowestPricePercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestPricePercent')
      }),
      align: 'center',
      render: (value, record) => {
        return (
          <StockChangeCell
            value={value}
            percentage={record.lowestPricePercent}
          />
        );
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
      title: t('actions'),
      dataIndex: 'action',
      key: 'action',
      fixed: isMobile ? undefined : 'right',
      align: 'center',
      width: 130,
      render: (_, record) => {
        const isExit = !!record.exitDate;
        return (
          <Space size='small'>
            <Tooltip title={isMobile ? null : t('notes')}>
              <Button
                onClick={() =>
                  modal.openModal(
                    <NotesSignal
                      signalId={record.id}
                      symbol={record.symbol}
                      pageName={fieldMapping['stockAlertLogs']}
                      title={t('noteSignalForSymbol')}
                    />,
                    {
                      width: 500
                    }
                  )
                }
                icon={
                  <Icon
                    icon='notes'
                    fill={
                      record.isNotes
                        ? 'var(--success-color)'
                        : 'var(--gray-color)'
                    }
                    width={22}
                    height={22}
                  />
                }
                css={notesBtnStyles}
              />
            </Tooltip>
            <Tooltip title={isMobile ? null : t('exit')}>
              <Button
                disabled={isExit}
                css={exitBtnStyles}
                icon={
                  <Icon
                    icon='exit'
                    width={22}
                    height={22}
                    fill={
                      isExit ? 'var(--gray-light-color)' : 'var(--orange-color)'
                    }
                  />
                }
                onClick={() =>
                  modal.openModal(
                    <ExitSignal
                      ids={[record.hashAlertLogId]}
                      description={t('confirmExitOne')}
                      title={
                        <>
                          {t('exit')}&nbsp;
                          {t('signal')}&nbsp;
                          <span
                            css={exitTitleStyles}
                          >{`"${record.symbol}"`}</span>
                        </>
                      }
                    />,
                    {
                      width: 400
                    }
                  )
                }
              />
            </Tooltip>
            <Tooltip title={isMobile ? null : 'Backtest'}>
              <Button
                icon={<Icon icon='tv' width={22} height={22} fill='#1296db' />}
                onClick={() =>
                  modal.openModal(<SignalInformation signal={record} />, {
                    width: 1200
                  })
                }
              />
            </Tooltip>
          </Space>
        );
      }
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
    'newStopLoss',
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
      <AlertLogsFilter defaultStrategyId={strategyId} onFilter={handleFilter} />
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <div css={titleContainerStyles}>
            <TableTitle customStyles={titleStyles}>
              <span>{t('alertLogs')}</span>
              <Tooltip title={!isMobile && t('refresh')}>
                <Button
                  onClick={handleRefresh}
                  type='text'
                  icon={
                    <Icon
                      customStyles={refreshIconStyles}
                      icon='refresh'
                      width={22}
                      height={22}
                    />
                  }
                  shape='circle'
                />
              </Tooltip>
            </TableTitle>
            <div css={exitBtnContainerStyles}>
              {selectedIds.size > 0 && (
                <Button
                  onClick={() =>
                    modal.openModal(
                      <ExitSignal
                        ids={Array.from(selectedIds)}
                        setSelectedIds={setSelectedIds}
                        title={t('exitSelectedSignals')}
                        description={t('confirmExitSelected')}
                      />,
                      { width: 400 }
                    )
                  }
                  icon={
                    <Icon
                      icon='exit'
                      fill={
                        selectedIds.size <= 0
                          ? 'var(--gray-light-color)'
                          : 'var(--orange-color)'
                      }
                      width={18}
                      height={18}
                    />
                  }
                  css={exitBtnStyles}
                  disabled={selectedIds.size <= 0}
                  size={isMobile ? 'small' : 'middle'}
                  danger
                >
                  {t('exitSelected')}
                </Button>
              )}
            </div>
          </div>

          <Segmented
            css={segmentedStyles}
            options={[
              {
                label: <div css={segmentedLabelStyles}>{t('stocks')}</div>,
                value: AlertLogsView.STOCKS
              },
              {
                label: <div css={segmentedLabelStyles}>{t('options')}</div>,
                value: AlertLogsView.OPTIONS
              }
            ]}
            defaultValue={
              isOption ? AlertLogsView.OPTIONS : AlertLogsView.STOCKS
            }
            onChange={(value) => handleChangeView(value)}
          />
          {(isDesktop || (isMobile && selectedIds.size > 0)) && (
            <div css={actionStyles}>
              {isDesktop && (
                <Space>
                  <ExportExcelLog />
                  <ImportSymbolButton url='tickers-profile/import' />
                  <DownloadSymbolTemplateButton />
                </Space>
              )}
            </div>
          )}
        </div>
        <Table<Signal>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          rowSelection={isMobile ? undefined : rowSelection}
          columns={columns}
          dataSource={alertLogsData}
          loading={loading}
          scroll={{
            x: 1200,
            y:
              alertLogsData.length > 0
                ? width >= 1624
                  ? height - 340
                  : sideBarCollapsed
                  ? height - 340
                  : height - 380
                : undefined
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

const titleStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  span {
    line-height: 2rem;
  }
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

const tableTopStyles = css`
  display: flex;
  justify-content: ${isMobile ? 'center' : 'space-between'};
  flex-wrap: wrap;
  align-items: center;
  padding: 1.2rem 1.6rem;
  gap: 1.4rem;
  position: relative;
`;

const actionStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  width: ${isMobile ? '100%' : 'unset'};
`;

const segmentedStyles = css`
  padding: 0;
  .ant-segmented-item-selected {
    background: var(--primary-color);
    color: var(--white-color);
  }
  position: ${!isMobile && 'absolute'};
  top: 50%;
  left: 50%;
  transform: ${!isMobile && 'translate(-50%, -50%)'};
`;

const segmentedLabelStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  font-weight: 500;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const notesBtnStyles = css`
  display: flex;
  align-items: center;
  padding: 0 !important;
`;

const exitBtnStyles = css`
  display: flex;
  margin-right: auto;
`;

const exitTitleStyles = css`
  font-style: italic;
`;

const recommendationStyles = css`
  text-transform: uppercase;
`;

const titleContainerStyles = css`
  display: flex;
  gap: 1.4rem;
  align-items: center;
  width: ${isMobile && '100%'};
`;

const exitBtnContainerStyles = css`
  width: 14.5rem;
`;

const refreshIconStyles = css`
  margin-top: 0.2rem;
`;
