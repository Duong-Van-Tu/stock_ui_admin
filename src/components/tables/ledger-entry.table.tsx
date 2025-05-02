/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect } from 'react';
import { Table, TableColumnsType } from 'antd';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchLedgerEntryLoading,
  watchLedgerEntry,
  getLedgerEntry
} from '@/redux/slices/ledger-entry.slice';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSearchParams } from 'next/navigation';
import { SocketContext } from '@/providers/socket.provider';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { calculatePercentage, roundToDecimals } from '@/utils/common';
import { getCurrentPrice } from '@/helpers/socket.helper';

export const LedgerEntryTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const { height } = useWindowSize();

  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const LedgerEntry = useAppSelector(watchLedgerEntry);
  const loading = useAppSelector(watchLedgerEntryLoading);

  const fetchDataStockScore = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit
    }: PageChangeParams = {}) => {
      dispatch(
        getLedgerEntry({
          page,
          limit: pageSize,
          symbol: symbol ? symbol : undefined
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  useEffect(() => {
    fetchDataStockScore();
  }, [fetchDataStockScore]);

  useEffect(() => {
    LedgerEntry.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LedgerEntry]);

  const columns: TableColumnsType<LedgerEntry> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) => index + 1
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
      width: 100,
      align: 'center'
    },
    {
      title: t('entryDate'),
      dataIndex: 'entryDate',
      key: 'entryDate',
      align: 'center',
      width: 130,
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('entryPrice'),
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      width: 140,
      align: 'center',
      defaultSortOrder: 'descend',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('exitDate'),
      dataIndex: 'exitDate',
      key: 'exitDate',
      width: 140,
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: t('exitPrice'),
      dataIndex: 'exitPrice',
      key: 'exitPrice',
      width: 140,
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
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: 90,
      align: 'center',
      render: (_, record) =>
        record.entryPrice && record.exitPrice ? (
          <PositiveNegativeText
            isPositive={record.entryPrice <= record.exitPrice}
            isNegative={record.entryPrice > record.entryPrice}
          >
            {record.entryPrice <= record.exitPrice ? (
              <span>{t('win')}</span>
            ) : (
              <span>{t('loss')}</span>
            )}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'Stock P/L',
      dataIndex: 'priceChange',
      key: 'priceChange',
      width: 140,
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        const percentage = calculatePercentage(record.entryPrice, price);
        return price ? (
          <StockChangeCell value={price} percentage={percentage} />
        ) : (
          '-'
        );
      }
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      align: 'center'
    },
    {
      title: 'Strike',
      dataIndex: 'strike',
      key: 'strike',
      width: 80,
      align: 'center'
    },
    {
      title: 'Expiration',
      dataIndex: 'expiration',
      key: 'expiration',
      width: 124,
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: (
        <>
          Premium <br />
          Paid <br />
          Received
        </>
      ),
      dataIndex: 'premium',
      key: 'premium',
      width: 124,
      align: 'center',
      render: (_, record) => (
        <>
          {record.premiumPay ?? '-'} <br />
          {record.premiumReceive ?? '-'}
        </>
      )
    },
    {
      title: (
        <>
          Investment <br /> Cash Out <br /> Cash In
        </>
      ),
      dataIndex: 'premium',
      key: 'premium',
      width: 124,
      align: 'center',
      render: (_, record) => (
        <>
          {record.investCashIn ?? '-'} <br />
          {record.investCashOut ?? '-'}
        </>
      )
    },
    {
      title: 'No. of Contracts',
      dataIndex: 'contracts',
      key: 'contracts',
      width: 134,
      align: 'center'
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      width: 114,
      align: 'center'
    },
    {
      title: (
        <>
          P/L (Amount) <br />
          P/L (%)
        </>
      ),
      dataIndex: 'plAmount',
      key: 'plAmount',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const { investCashIn, investCashOut } = record;
        if (!(investCashIn && investCashOut)) return '-';
        const plAmount = investCashOut - investCashIn;
        const plAmountPercent = (plAmount / investCashIn) * 100;

        return (
          <StockChangeCell value={plAmount} percentage={plAmountPercent} />
        );
      }
    },
    {
      title: (
        <>
          Cumulative <br />
          Gain/Loss
        </>
      ),
      dataIndex: 'cumulative',
      key: 'cumulative',
      width: 130,
      align: 'center',
      render: (_, record, index) => {
        const initialBalance = 5000;
        const { investCashOut, investCashIn, commission } = record;
        if (
          LedgerEntry.length === 0 ||
          !investCashOut ||
          !investCashIn ||
          !commission
        )
          return '-';
        // const filteredList = LedgerEntry.slice(0, index + 1);
        const cumulativeGainLoss = LedgerEntry.slice(0, index + 1).reduce(
          (sum, entry) =>
            sum + (entry.investCashOut - entry.investCashIn - entry.commission),
          0
        );

        const cumulativeGainLossPercent =
          (cumulativeGainLoss / initialBalance) * 100;
        return (
          <StockChangeCell
            value={cumulativeGainLoss}
            percentage={cumulativeGainLossPercent}
          />
        );
      }
    },
    {
      title: (
        <>
          Balance <br />
          5000$
        </>
      ),
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      align: 'center',
      render: (_, record, index) => {
        const initialBalance = 5000;
        const { investCashOut, investCashIn, commission } = record;
        if (
          LedgerEntry.length === 0 ||
          !investCashOut ||
          !investCashIn ||
          !commission
        )
          return '-';
        const filteredList = LedgerEntry.slice(0, index + 1);
        const cumulativeGainLoss = filteredList.reduce(
          (sum, entry) =>
            sum + (entry.investCashOut - entry.investCashIn - entry.commission),
          0
        );

        const balance = initialBalance + cumulativeGainLoss;
        return roundToDecimals(balance);
      }
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      align: 'center'
    },
    {
      title: t('notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      align: 'center'
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>Ledger Entry</TableTitle>
      </div>
      <Table<LedgerEntry>
        css={tableStyles}
        rowKey='id'
        columns={columns}
        dataSource={LedgerEntry}
        loading={loading}
        scroll={{
          x: 1200,
          y: LedgerEntry.length > 0 ? height - 278 : undefined
        }}
        sortDirections={['descend', 'ascend']}
        locale={{
          emptyText: (
            <div css={emptyStyles(height - 400)}>
              <EmptyDataTable />
            </div>
          )
        }}
        pagination={false}
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
`;

const titleStyles = css`
  min-width: 30%;
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.2rem 1.4rem;
  gap: 1.4rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
