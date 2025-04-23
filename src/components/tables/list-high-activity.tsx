/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Table, TableColumnsType } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatMarketCap,
  formatNumberShort,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { SymbolCell } from './columns/symbol-cell.column';
import {
  getListHighActivity,
  watchListHighActivity,
  watchListHighActivityLoading,
  watchListHighActivityPagination
} from '@/redux/slices/high-activity.slice';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { ListHighActivityFilter } from '../filters/list-high-activity.filter';

export const ListHighActivity = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const loading = useAppSelector(watchListHighActivityLoading);
  const listHighActivity = useAppSelector(watchListHighActivity);
  const pagination = useAppSelector(watchListHighActivityPagination);

  const [filter, setFilter] = useState<ListHighActivityFilter>({});

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<ListHighActivityFilter>({
      defaultField: 'datetime',
      defaultOrder: 'descend',
      currentFilter: filter,
      onChange: (_field, _order, newFilter) => {
        setFilter(newFilter);
        fetchListHighActivity({
          page: PAGINATION.currentPage,
          pageSize: pagination.pageSize,
          filter: newFilter
        });
      }
    });

  const fetchListHighActivity = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getListHighActivity({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFilter = useCallback(
    (values: ListHighActivityFilter) => {
      setFilter((prev) => {
        const newFilter = {
          ...prev,
          ...values
        };
        fetchListHighActivity({ filter: newFilter });
        return newFilter;
      });
    },
    [fetchListHighActivity]
  );

  const columns: TableColumnsType<ListHighActivity> = [
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
      width: 100,
      fixed: 'left',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'symbol' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('symbol')
      }),
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('datetime'),
      dataIndex: 'datetime',
      key: 'datetime',
      width: 134,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'datetime' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('datetime')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('timeframe'),
      dataIndex: 'timeframe',
      key: 'timeframe',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'timeframe' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('timeframe')
      }),
      align: 'center',
      render: (value) => (value ? formatNumberShort(value) : '-')
    },
    {
      title: t('volume'),
      dataIndex: 'avgVolume',
      key: 'avgVolume',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'avgVolume' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('avgVolume')
      }),
      align: 'center',
      render: (value) => (value ? formatNumberShort(value) : '-')
    },
    {
      title: t('atr'),
      dataIndex: 'atr',
      key: 'atr',
      width: 90,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 90,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value) : '-')
    },
    {
      title: t('marketCap'),
      dataIndex: 'marketCapHighActivity',
      key: 'marketCapHighActivity',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketCapHighActivity' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCapHighActivity')
      }),
      align: 'center',
      render: (value) => (value ? formatMarketCap(value) : '-')
    },
    {
      title: t('underWillrMinus80'),
      dataIndex: 'underWillrMinus80',
      key: 'underWillrMinus80',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'underWillrMinus80' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('underWillrMinus80')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('underSma50'),
      dataIndex: 'underSma50',
      key: 'underSma50',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'underSma50' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('underSma50')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('underSma200'),
      dataIndex: 'underSma200',
      key: 'underSma200',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'underSma200' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('underSma200')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('dropPct'),
      dataIndex: 'dropPct',
      key: 'dropPct',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dropPct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('dropPct')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value >= 0} isNegative={value < 0}>
            <span>{formatPercent(value)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('drop1_5Pct'),
      dataIndex: 'drop1_5Pct',
      key: 'drop1_5Pct',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop1_5Pct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop1_5Pct')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('drop3Pct'),
      dataIndex: 'drop3Pct',
      key: 'drop3Pct',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop3Pct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop3Pct')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('drop5Pct'),
      dataIndex: 'drop5Pct',
      key: 'drop5Pct',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop5Pct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop5Pct')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('dropPct2prev'),
      dataIndex: 'dropPct2prev',
      key: 'dropPct2prev',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dropPct2prev' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('dropPct2prev')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value >= 0} isNegative={value < 0}>
            <span>{formatPercent(value)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('drop3Pct2prev'),
      dataIndex: 'drop3Pct2prev',
      key: 'drop3Pct2prev',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop3Pct2prev' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop3Pct2prev')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('drop5Pct2prev'),
      dataIndex: 'drop5Pct2prev',
      key: 'drop5Pct2prev',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop5Pct2prev' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop5Pct2prev')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('drop10Pct2prev'),
      dataIndex: 'drop10Pct2prev',
      key: 'drop10Pct2prev',
      width: 146,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop10Pct2prev' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop10Pct2prev')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('criticalNews'),
      dataIndex: 'drop10Pct2prev',
      key: 'drop10Pct2prev',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'drop10Pct2prev' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('drop10Pct2prev')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('nextEarnings'),
      dataIndex: 'nextEarning',
      key: 'nextEarning',
      width: 134,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'nextEarning' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('nextEarning')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value} isNegative={!value}>
          <span>{value ? t('yes') : t('no')}</span>
        </PositiveNegativeText>
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
          <span>-</span>
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
          <span>-</span>
        )
    }
  ];

  return (
    <div css={rootStyles}>
      <ListHighActivityFilter onFilter={handleFilter} />
      <div css={tableWrapperStyles}>
        <Table<ListHighActivity>
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={listHighActivity}
          loading={loading}
          scroll={{
            x: 1200,
            y: listHighActivity.length > 0 ? height - 210 : undefined
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
              fetchListHighActivity({ page, pageSize, filter });
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

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
