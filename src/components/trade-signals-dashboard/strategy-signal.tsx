/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { cleanFalsyValues, formatNumber } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { PositiveNegativeText } from '../positive-negative-text';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { watchSearchSymbol } from '@/redux/slices/search';
import { SocketContext } from '@/providers/socket.provider';
import { getCurrentPrice } from '@/helpers/socket.helper';
import {
  getSignalStrategyId,
  watchSignalByStrategyId
} from '@/redux/slices/signals.slice';
import { DateTimeCell } from '../tables/columns/date-time-cell.column';
import { SymbolCell } from '../tables/columns/symbol-cell.column';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';

type StrategySignalProps = {
  isETF?: number;
  strategyId: number;
};
export const StrategySignal = ({
  isETF = 0,
  strategyId
}: StrategySignalProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const symbol = useAppSelector(watchSearchSymbol);
  const { setWatchList, resFromWS } = useContext(SocketContext);

  const strategyData = useAppSelector(watchSignalByStrategyId);

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

    fetchSignalByStrategy({
      filter: newFilter
    });
  };

  const fetchSignalByStrategy = useCallback(
    ({ filter }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getSignalStrategyId({
          sortField: fieldMapping[sortField],
          sortType: convertSortType(sortType),
          ...filteredFilter,
          isImport: isETF,
          strategyId,
          page: PAGINATION.currentPage,
          limit: PAGINATION_PARAMS.unLimit
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setFilter((prev) => ({ ...prev, symbol }));
    fetchSignalByStrategy({ filter: { symbol } });
  }, [symbol, fetchSignalByStrategy]);

  useEffect(() => {
    strategyData[`${strategyId}`]?.forEach((row) => {
      setWatchList(row.symbol);
    });
  }, [strategyData, setWatchList]);

  const columns: TableColumnsType<AlertLogs> = [
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 80,
      fixed: 'left',
      render: (value) => <SymbolCell symbol={value} />
    },
    {
      title: t('period'),
      dataIndex: 'timeFrame',
      key: 'timeFrame',
      width: 100,
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'timeFrame' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('timeFrame')
      })
    },
    {
      title: t('entryDate'),
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
      align: 'center',
      sorter: true,
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
      width: 120,
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: true,
      sortOrder: sortField === 'entryPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('entryPrice')
      }),
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('exitDate'),
      dataIndex: 'exitDate',
      key: 'exitDate',
      width: 120,
      align: 'center',
      sorter: true,
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
      sortOrder: sortField === 'exitPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('exitPrice')
      }),
      render: (value, record) => (
        <PositiveNegativeText
          isPositive={value >= record.entryPrice}
          isNegative={value < record.entryPrice}
        >
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('currentPrice'),
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 130,
      sorter: true,
      sortOrder: sortField === 'currentPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('currentPrice')
      }),
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        return (
          <PositiveNegativeText
            isPositive={price >= record.entryPrice}
            isNegative={price < record.entryPrice}
          >
            {price ? formatNumber(price, 2) : '-'}
          </PositiveNegativeText>
        );
      }
    },
    {
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        return (
          <PositiveNegativeText
            isPositive={record.plPercent >= 0}
            isNegative={record.plPercent < 0}
          >
            {record.plPercent
              ? record.plPercent >= 0
                ? t('win')
                : t('loss')
              : '-'}
          </PositiveNegativeText>
        );
      }
    }
  ];

  return (
    <Table<AlertLogs>
      css={tableStyles}
      rowKey={(record) => record.key}
      columns={columns}
      dataSource={strategyData[`${strategyId}`]}
      scroll={{ x: 500, y: 55 * 5 }}
      sortDirections={['descend', 'ascend']}
      pagination={false}
    />
  );
};

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }

  .ant-table-body {
    overflow: hidden !important;
  }

  &:hover .ant-table-body {
    overflow: auto !important;
  }
`;
