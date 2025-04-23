/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import { EarningFilter } from '../filters/earnings.filter';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEarnings,
  watchEarningPagination,
  watchEarnings,
  watchEarningsLoading
} from '@/redux/slices/earnings.slice';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import dayjs from 'dayjs';
import { watchSearchSymbol } from '@/redux/slices/search';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';

import {
  cleanFalsyValues,
  formatNumberShort,
  roundToDecimals
} from '@/utils/common';
import { SymbolCell } from './columns/symbol-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { useSortOrder } from '@/hooks/sort-order.hook';

export const EarningsTable = () => {
  const t = useTranslations();
  const locale = useLocale() || 'en';
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const pagination = useAppSelector(watchEarningPagination);
  const earnings = useAppSelector(watchEarnings);
  const symbol = useAppSelector(watchSearchSymbol);
  const loading = useAppSelector(watchEarningsLoading);
  const [filter, setFilter] = useState<EarningFilter>({
    date: dayjs().format('YYYY-MM-DD')
  });

  const earningDate = useMemo(
    () =>
      filter.date
        ? dayjs(filter.date, 'YYYY/MM/DD').format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
    [filter.date]
  );

  const { sortField, sortType, handleSortOrder } = useSortOrder<EarningFilter>({
    defaultField: 'epsEstimate',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchEarnings({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const handleFilter = (values: EarningFilter) => {
    const newFilter = {
      ...filter,
      ...values
    };
    setFilter(newFilter);
    fetchEarnings({ filter: newFilter });
  };

  const fetchEarnings = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);

      dispatch(
        getEarnings({
          page,
          limit: pageSize,
          ...filteredFilter
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    setFilter((prev) => ({ ...prev, symbol, date: earningDate }));
    fetchEarnings({ filter: { symbol, date: earningDate } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEarnings, symbol]);

  const columns: TableColumnsType<Earning> = [
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
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell symbol={record.symbol} companyName={record.companyName} />
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
          <span>-</span>
        )
    },
    {
      title: t('epsEstimate'),
      dataIndex: 'epsEstimate',
      key: 'epsEstimate',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'epsEstimate' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('epsEstimate')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('epsActual'),
      dataIndex: 'epsActual',
      key: 'epsActual',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'epsActual' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('epsActual')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('epsSurprise'),
      dataIndex: 'epsSurprise',
      key: 'epsSurprise',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'epsSurprise' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('epsSurprise')
      }),
      align: 'center',
      render: (value, record) =>
        value ? (
          <StockChangeCell
            value={value}
            percentage={
              record.epsSurprisePercent ? record.epsSurprisePercent : 0
            }
          />
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('revenueActual'),
      dataIndex: 'revenueActual',
      key: 'revenueActual',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'revenueActual' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('revenueActual')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{formatNumberShort(value)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('revenueEstimate'),
      dataIndex: 'revenueEstimate',
      key: 'revenueEstimate',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'revenueEstimate' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('revenueEstimate')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{formatNumberShort(value)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('revenueSurprise'),
      dataIndex: 'revenueSurprise',
      key: 'revenueSurprise',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'revenueSurprise' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('revenueSurprise')
      }),
      align: 'center',
      render: (value, record) =>
        value ? (
          <StockChangeCell
            value={formatNumberShort(value)}
            percentage={
              record.revenueSurprisePercent ? record.revenueSurprisePercent : 0
            }
          />
        ) : (
          <span>-</span>
        )
    }
  ];

  return (
    <div css={rootStyles}>
      <EarningFilter onFilter={handleFilter} />
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <TableTitle>
            {t('earningTitle')}&nbsp;
            {dayjs(earningDate).locale(locale).format('ddd, MMM DD')}
          </TableTitle>
        </div>
        <Table<Earning>
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={earnings}
          loading={loading}
          scroll={{
            x: 1200,
            y: earnings.length > 0 ? height - 364 : undefined
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
              fetchEarnings({
                page,
                pageSize,
                filter
              });
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

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.6rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
