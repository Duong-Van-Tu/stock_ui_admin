/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect } from 'react';
import { Button, Space, Table, TableColumnsType } from 'antd';
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
import {
  calculatePercentage,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
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

  const handleUpdate = (record: LedgerEntry) => {
    // TODO: implement update logic
    console.log('Update record', record);
  };

  const handleDelete = (record: LedgerEntry) => {
    // TODO: implement delete logic
    console.log('Delete record', record);
  };

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
        const price = currPrice;
        const percentage = price
          ? calculatePercentage(record.entryPrice, price)
          : value;
        return price ? (
          <StockChangeCell value={price} percentage={percentage} />
        ) : value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{formatPercent(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        );
      }
    },
    {
      title: t('action'),
      dataIndex: 'action',
      key: 'action',
      width: 180,
      align: 'center'
    },
    {
      title: t('strike'),
      dataIndex: 'strike',
      key: 'strike',
      width: 80,
      align: 'center'
    },
    {
      title: t('expiration'),
      dataIndex: 'expiration',
      key: 'expiration',
      width: 124,
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: (
        <span
          dangerouslySetInnerHTML={{ __html: t('premiumPaidReceived') }}
        ></span>
      ),
      dataIndex: 'premium',
      key: 'premium',
      width: 120,
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
        <span dangerouslySetInnerHTML={{ __html: t('investmentCash') }}></span>
      ),
      dataIndex: 'investment',
      key: 'investment',
      width: 124,
      align: 'center',
      render: (_, record) => (
        <>
          {record.investCashOut ?? '-'} <br />
          {record.investCashIn ?? '-'}
        </>
      )
    },
    {
      title: t('contracts'),
      dataIndex: 'contracts',
      key: 'contracts',
      width: 134,
      align: 'center'
    },
    {
      title: t('commission'),
      dataIndex: 'commission',
      key: 'commission',
      width: 114,
      align: 'center'
    },
    {
      title: <span dangerouslySetInnerHTML={{ __html: t('plAmount') }}></span>,
      dataIndex: 'plAmount',
      key: 'plAmount',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const { investCashIn, investCashOut } = record;
        if (!(investCashIn && investCashOut)) return '-';
        const plAmount = investCashIn - investCashOut;
        const plAmountPercent = (plAmount / investCashIn) * 100;

        return (
          <StockChangeCell value={plAmount} percentage={plAmountPercent} />
        );
      }
    },
    {
      title: (
        <span
          dangerouslySetInnerHTML={{ __html: t('cumulativeGainLoss') }}
        ></span>
      ),
      dataIndex: 'cumulative',
      key: 'cumulative',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const initialBalance = 5000;
        const { investCashOut, investCashIn, commission } = record;
        if (
          LedgerEntry.length === 0 ||
          !investCashOut ||
          !investCashIn ||
          !commission
        )
          return '-';
        const cumulativeGainLoss =
          record.investCashIn - record.investCashOut - record.commission;

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
      title: <span dangerouslySetInnerHTML={{ __html: t('balance') }}></span>,
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const initialBalance = 5000;
        const { investCashOut, investCashIn, commission } = record;
        if (
          LedgerEntry.length === 0 ||
          !investCashOut ||
          !investCashIn ||
          !commission
        )
          return '-';
        const cumulativeGainLoss =
          record.investCashIn - record.investCashOut - record.commission;
        const balance = initialBalance + cumulativeGainLoss;
        return roundToDecimals(balance);
      }
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      width: 140,
      align: 'center'
    },
    {
      title: t('notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 160,
      align: 'center'
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 186,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type='primary' onClick={() => handleUpdate(record)}>
            {t('update')}
          </Button>
          <Button danger onClick={() => handleDelete(record)}>
            {t('delete')}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('ledgerEntryTitle')}
        </TableTitle>
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
