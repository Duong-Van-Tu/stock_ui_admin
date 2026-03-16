/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Card, Table, TableColumnsType } from 'antd';
import { cleanFalsyValues, roundToDecimals } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { PositiveNegativeText } from '../positive-negative-text';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { SocketContext } from '@/providers/socket.provider';
import {
  getSignalStrategyId,
  watchSignalByStrategyId
} from '@/redux/slices/signals.slice';
import { DateTimeCell } from '../tables/columns/date-time-cell.column';
import { SymbolCell } from '../tables/columns/symbol-cell.column';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import Link from 'next/link';
import { PageURLs } from '@/utils/navigate';
import { EmptyDataTable } from '../tables/empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';

type StrategySignalProps = {
  strategyId: number;
  strategyName: string;
};
export const StrategySignal = ({
  strategyId,
  strategyName
}: StrategySignalProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList } = useContext(SocketContext);

  const strategyData = useAppSelector(watchSignalByStrategyId);
  const signalStrategyLoading = useAppSelector(
    (state) => state.signals.signalStrategyLoading?.[strategyId] || false
  );

  const signalStrategyPagination = useAppSelector(
    (state) => state.signals.paginationByStrategyId?.[strategyId] || false
  );

  const [filter, setFilter] = useState<Filter>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder<Filter>({
    defaultField: 'entryDate',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchSignalByStrategy({
        filter: newFilter
      });
    }
  });

  const fetchSignalByStrategy = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = 5,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getSignalStrategyId({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          strategyId,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (strategyId) {
      fetchSignalByStrategy();
    }
  }, [fetchSignalByStrategy, strategyId]);

  useEffect(() => {
    strategyData[`${strategyId}`]?.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyData, strategyId]);

  const columns: TableColumnsType<Signal> = [
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: 'left',
      render: (value, record) => (
        <SymbolCell
          isNews={record.isNews}
          earningDate={record.earningDate}
          isNewsNegative={record.isNewsNegative}
          symbol={value}
          signalId={record.id}
          stockInfo={record.stockInfo}
        />
      )
    },
    {
      title: t('period'),
      dataIndex: 'timeFrame',
      key: 'timeFrame',
      width: isMobile ? 80 : 110,
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
      width: isMobile ? 108 : 134,
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
      width: isMobile ? 110 : 130,
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
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: 90,
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

  return (
    <Card
      size={isMobile ? 'small' : 'default'}
      css={cardStyles}
      title={
        <Link
          href={`${PageURLs.ofAlertLogs()}?strategyId=${strategyId}`}
          css={strategyLinkStyles}
        >
          {strategyName}
        </Link>
      }
    >
      <Table<Signal>
        size={isMobile ? 'small' : 'middle'}
        loading={signalStrategyLoading}
        css={tableStyles(strategyData[`${strategyId}`]?.length === 0)}
        rowKey={(record) => record.key}
        columns={columns}
        dataSource={strategyData[`${strategyId}`]}
        showHeader={strategyData[`${strategyId}`]?.length > 0}
        scroll={
          strategyData[`${strategyId}`]?.length > 0
            ? { x: 600, y: undefined }
            : undefined
        }
        sortDirections={['descend', 'ascend']}
        locale={{
          emptyText: (
            <div css={emptyStyles}>
              <EmptyDataTable />
            </div>
          )
        }}
        pagination={
          signalStrategyPagination.total > 5
            ? {
                position: ['bottomCenter'],
                showSizeChanger: false,
                current: signalStrategyPagination.currentPage,
                pageSize: signalStrategyPagination.pageSize,
                total: signalStrategyPagination.total,
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
    padding: ${isMobile
      ? '0.6rem 0.8rem !important'
      : '0.8rem 1rem !important'};
    border-bottom: ${isEmpty
      ? 'unset'
      : '1px solid var(--border-table-color)'} !important;
    height: ${isEmpty ? '33.2rem' : 'unset'};
  }

  .ant-table-placeholder .ant-table-cell {
    border-bottom: none !important;
  }
`;

const cardStyles = css`
  width: 100%;
  .ant-card-body {
    border-top: 1px solid var(--border-table-color);
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
  font-size: ${isMobile ? '1.6rem' : '1.8rem'};
`;
