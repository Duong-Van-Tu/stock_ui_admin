/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatMarketCap,
  formatNumber
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { watchSearchSymbol } from '@/redux/slices/search';
import { TableTitle } from './title.table';
import { Icon } from '../icons';
import { SocketContext } from '@/providers/socket.provider';
import { getCurrentPrice } from '@/helpers/socket.helper';
import {
  getAlertLogs,
  watchAlertLogsData,
  watchAlertLogsLoading,
  watchAlertLogsPagination
} from '@/redux/slices/alert-logs.slice';
import { DateTimeCell } from './columns/date-time-cell.cloumn';

export const AlertLogsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const symbol = useAppSelector(watchSearchSymbol);
  const { setWatchList, resFromWS } = useContext(SocketContext);

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
      sortField: newSortType ? fieldMapping[field] : undefined,
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

  useEffect(() => {
    setFilter((prev) => ({ ...prev, symbol }));
    fetchDataAlertLogs({ filter: { symbol } });
  }, [symbol, fetchDataAlertLogs]);

  useEffect(() => {
    alertLogsData.forEach((row) => {
      setWatchList(row.symbol);
    });
  }, [alertLogsData, setWatchList]);

  const columns: TableColumnsType<AlertLogs> = [
    {
      title: t('no'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: true,
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 200,
      fixed: true,
      render: (_, record) => (
        <SymbolCell
          symbol={record.symbol}
          companyName={record.companyName}
          isNews={record.isNews}
        />
      )
    },
    {
      title: t('strategy'),
      dataIndex: 'strategyName',
      key: 'strategyName',
      width: 180,
      align: 'center',
      fixed: true,
      sorter: true,
      sortOrder: sortField === 'strategyName' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('strategyName')
      })
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
      width: 140,
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
      width: 140,
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
      width: 150,
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
      dataIndex: 'price',
      key: 'price',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('price')
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
      title: t('highestPrice'),
      dataIndex: 'highestPrice',
      key: 'highestPrice',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'highestPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPrice')
      }),
      align: 'center',
      render: (value, record) => {
        return (
          <PositiveNegativeText
            isPositive={value >= record.entryPrice}
            isNegative={value < record.entryPrice}
          >
            {value ? formatNumber(value, 2) : '-'}
          </PositiveNegativeText>
        );
      }
    },
    {
      title: t('highestPriceDate'),
      dataIndex: 'highestUpdateAt',
      key: 'highestUpdateAt',
      width: 164,
      sorter: true,
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
      sortOrder: sortField === 'lowestPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestPrice')
      }),
      align: 'center',
      render: (value, record) => {
        return (
          <PositiveNegativeText
            isPositive={value >= record.entryPrice}
            isNegative={value < record.entryPrice}
          >
            {value ? formatNumber(value, 2) : '-'}
          </PositiveNegativeText>
        );
      }
    },
    {
      title: t('lowestPriceDate'),
      dataIndex: 'lowestUpdateAt',
      key: 'lowestUpdateAt',
      width: 164,
      sorter: true,
      sortOrder: sortField === 'lowestUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowestUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: 'Market cap',
      dataIndex: 'marketCap',
      key: 'marketCap',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'marketCap' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCap')
      }),
      align: 'center',
      render: (value) => (value ? formatMarketCap(value) : '-')
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('volume')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 110,
      sorter: true,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('atr'),
      dataIndex: 'atr',
      key: 'atr',
      width: 100,
      sorter: true,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('totalScore'),
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'totalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('fundamentalScore'),
      dataIndex: 'fundamentalScore',
      key: 'fundamentalScore',
      width: 170,
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'fundamentalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('fundamentalScore')
      }),
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('sentimentScore'),
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 160,
      sorter: true,
      sortOrder: sortField === 'sentimentScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentimentScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('earningsScore'),
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'earningsScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('earningsScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('ytd'),
      dataIndex: 'ytd',
      key: 'ytd',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'ytd' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('ytd')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle>{t('alertLogs')}</TableTitle>
        <div css={actionStyles}>
          <Button
            icon={
              <Icon
                icon='exportExcel'
                width={18}
                height={18}
                fill='var(--white-color)'
              />
            }
            type='primary'
          >
            {t('exportExcel')}
          </Button>
        </div>
      </div>
      <Table<AlertLogs>
        css={tableStyles}
        rowKey={(record) => record.key}
        columns={columns}
        dataSource={alertLogsData}
        loading={loading}
        scroll={{ x: 1200, y: 55 * 11 }}
        sortDirections={['descend', 'ascend']}
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
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
  .add-my-portfolios {
    background: var(--added-portfolio-color);
  }
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.4rem;
`;

const actionStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;
