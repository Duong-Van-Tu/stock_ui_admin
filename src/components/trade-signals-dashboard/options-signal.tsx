/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Card, Table, TableColumnsType } from 'antd';
import {
  calculatePercentage,
  cleanFalsyValues,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { PositiveNegativeText } from '../positive-negative-text';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { SocketContext } from '@/providers/socket.provider';
import { getCurrentPrice } from '@/helpers/socket.helper';
import {
  getAlertLogs,
  watchAlertLogsLoading,
  watchAlertLogsPagination,
  watchSignalOptions
} from '@/redux/slices/signals.slice';
import { DateTimeCell } from '../tables/columns/date-time-cell.column';
import { SymbolCell } from '../tables/columns/symbol-cell.column';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import Link from 'next/link';
import { PageURLs } from '@/utils/navigate';
import { EmptyDataTable } from '../tables/empty.table';
import { StockChangeCell } from '../tables/columns/stock-change-cell.column';

export const OptionSignal = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);

  const strategyData = useAppSelector(watchSignalOptions);
  const loading = useAppSelector(watchAlertLogsLoading);
  const pagination = useAppSelector(watchAlertLogsPagination);

  const [sortField, setSortField] = useState<string>('entryDate');
  const [sortType, setSortType] = useState<SortOrder>('descend');
  const [filter, setFilter] = useState<Filter>({});

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
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = 5,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getAlertLogs({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField],
          sortType: convertSortType(sortType),
          isOptions: true,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    fetchSignalByStrategy();
  }, [fetchSignalByStrategy]);

  useEffect(() => {
    strategyData.forEach((row) => {
      setWatchList(row.symbol);
    });
  }, [strategyData, setWatchList]);

  const columns: TableColumnsType<Signal> = [
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 90,
      fixed: 'left',
      render: (value) => <SymbolCell symbol={value} />
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
      width: 134,
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
      width: 120,
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
      width: 120,
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
      width: 130,
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
      width: 130,
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
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: 90,
      align: 'center',
      fixed: 'right',
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

  return (
    <Card
      css={cardStyles}
      title={
        <Link
          href={`${PageURLs.ofAlertLogs()}?isOption=1`}
          css={strategyLinkStyles}
        >
          {t('strategyOptions')}
        </Link>
      }
    >
      <Table<Signal>
        loading={loading}
        css={tableStyles(strategyData.length === 0)}
        rowKey={(record) => record.key}
        columns={columns}
        dataSource={strategyData}
        showHeader={strategyData?.length > 0}
        scroll={strategyData.length > 0 ? { x: 600, y: undefined } : undefined}
        sortDirections={['descend', 'ascend']}
        locale={{
          emptyText: (
            <div css={emptyStyles}>
              <EmptyDataTable />
            </div>
          )
        }}
        pagination={
          pagination.total > 5
            ? {
                position: ['bottomCenter'],
                showSizeChanger: false,
                current: pagination.currentPage,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page, pageSize) => {
                  fetchSignalByStrategy({ page, pageSize, filter });
                }
              }
            : false
        }
      />
    </Card>
  );
};

const tableStyles = (isEmpty: boolean) => css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
    border-bottom: ${isEmpty ? 'unset' : '1px solid #f0f0f0'} !important;
    height: ${isEmpty ? '33.2rem' : 'unset'};
  }
`;

const cardStyles = css`
  width: 100%;
  .ant-card-body {
    border-top: 1px solid #f0f0f0;
    padding: 0;
    display: flex;
    align-items: center;
  }
`;

const emptyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 0;
`;

const strategyLinkStyles = css`
  display: block;
  text-align: center;
  font-size: 1.8rem;
`;
