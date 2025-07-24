/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useContext, useEffect } from 'react';
import {
  Button,
  Popconfirm,
  Space,
  Table,
  TableColumnsType,
  Tooltip
} from 'antd';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchLedgerEntryLoading,
  watchLedgerEntry,
  getLedgerEntry,
  watchCumulativeMap,
  watchBalanceMap,
  deleteLedgerEntry,
  resetState,
  watchInitialBalance,
  getUserBalance
} from '@/redux/slices/ledger-entry.slice';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useRouter, useSearchParams } from 'next/navigation';
import { SocketContext } from '@/providers/socket.provider';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { StockChangeCell } from './columns/stock-change-cell.column';
import {
  calculatePercentage,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
import { Icon } from '../icons';
import EllipsisText from '../ellipsis-text';
import { PageURLs } from '@/utils/navigate';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { PlusOutlined } from '@ant-design/icons';
import { ExportExcelLedgerEntry } from '../export-excel-ledger-entry';
import { isDesktop, isMobile } from 'react-device-detect';
import { useModal } from '@/hooks/modal.hook';
import DepositWithdrawForm from '../forms/deposit-withdraw.form';
import { calculateDIM } from '@/helpers/ledger-entry.helper';

export const LedgerEntryTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { setWatchList } = useContext(SocketContext);
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();
  const { height } = useWindowSize();
  const modal = useModal();

  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const ledgerEntry = useAppSelector(watchLedgerEntry);
  const loading = useAppSelector(watchLedgerEntryLoading);
  const cumulativeMap = useAppSelector(watchCumulativeMap);
  const balanceMap = useAppSelector(watchBalanceMap);
  const initialBalance = useAppSelector(watchInitialBalance);

  const handleDelete = async (id: number) => {
    const res = await dispatch(deleteLedgerEntry(id));
    if (isRequestSuccess(res)) {
      notifySuccess(t('deleteSuccess'));
    } else {
      notifyError(t('deleteError'));
    }
  };

  const fetchLegerEntry = useCallback(
    async ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.unLimit
    }: PageChangeParams = {}) => {
      await dispatch(
        getLedgerEntry({
          page,
          limit: pageSize,
          symbol: symbol ? symbol : undefined,
          sortField: 'exit_date',
          sortType: 'asc'
        })
      );
      dispatch(getUserBalance());
    },
    [dispatch, symbol]
  );

  useEffect(() => {
    fetchLegerEntry({});
  }, [fetchLegerEntry]);

  useEffect(() => {
    ledgerEntry.forEach((row) => {
      setWatchList(row.symbol);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerEntry]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const columns: TableColumnsType<LedgerEntry> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: !isMobile && 'left',
      render: (_, __, index) => index + 1
    },
    {
      title: t('strategy'),
      dataIndex: 'strategy',
      key: 'strategy',
      width: 130,
      align: 'center',
      fixed: !isMobile && 'left'
    },
    {
      title: t('entryDate'),
      dataIndex: 'entryDate',
      key: 'entryDate',
      align: 'center',
      width: 130,
      render: (value) =>
        value ? <DateTimeCell convertTimeZone={false} value={value} /> : '-'
    },
    {
      title: t('exitDate'),
      dataIndex: 'exitDate',
      key: 'exitDate',
      width: 130,
      align: 'center',
      render: (value) =>
        value ? <DateTimeCell convertTimeZone={false} value={value} /> : '-'
    },
    {
      title: t('holdingTime'),
      dataIndex: 'holdingTime',
      key: 'holdingTime',
      width: 60,
      align: 'center',
      render: (_, record) => calculateDIM(record.entryDate, record.exitDate)
    },
    {
      title: t('period'),
      dataIndex: 'period',
      key: 'period',
      width: 80,
      align: 'center'
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 90,
      align: 'center',
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('winOrLoss'),
      dataIndex: 'winOrLoss',
      key: 'winOrLoss',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const {
          investmentCashIn = 0,
          investmentCashOut = 0,
          commission = 0
        } = record;
        const hasValidData = investmentCashIn && investmentCashOut;

        if (!hasValidData) return '-';

        const netResult = investmentCashIn - investmentCashOut - commission;
        const isPositive = netResult >= 0;

        return (
          <PositiveNegativeText
            isPositive={isPositive}
            isNegative={!isPositive}
          >
            <span>{t(isPositive ? 'win' : 'loss')}</span>
          </PositiveNegativeText>
        );
      }
    },
    {
      title: t('action'),
      dataIndex: 'action',
      key: 'action',
      width: 160,
      align: 'center',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('strike'),
      dataIndex: 'strike',
      key: 'strike',
      width: 80,
      align: 'center',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('expiration'),
      dataIndex: 'expiration',
      key: 'expiration',
      width: 124,
      align: 'center',
      render: (value) =>
        value ? (
          <DateTimeCell
            convertTimeZone={false}
            showTime={false}
            value={value}
          />
        ) : (
          '-'
        )
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
          {record.premiumPaid ?? '-'} <br />
          {record.premiumReceive ?? '-'}
        </>
      )
    },
    {
      title: t('contracts'),
      dataIndex: 'contracts',
      key: 'contracts',
      width: 134,
      align: 'center',
      render: (value) => (value ? value : '-')
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
          {record.investmentCashOut ?? '-'} <br />
          {record.investmentCashIn ?? '-'}
        </>
      )
    },
    {
      title: t('commission'),
      dataIndex: 'commission',
      key: 'commission',
      width: 114,
      align: 'center',
      render: (value) => (value ? value : '-')
    },
    {
      title: <span dangerouslySetInnerHTML={{ __html: t('plAmount') }}></span>,
      dataIndex: 'plAmount',
      key: 'plAmount',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const {
          investmentCashOut = 0,
          investmentCashIn = 0,
          commission = 0
        } = record;
        if (!(investmentCashOut && investmentCashIn)) return '-';
        const plAmount = investmentCashIn - investmentCashOut - commission;
        const plAmountPercent = (plAmount / investmentCashOut) * 100;

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
        const cumulative = cumulativeMap[record.id];
        if (!cumulative) {
          return '-';
        }

        const cumulativePercent = (cumulative / initialBalance) * 100;
        return (
          <StockChangeCell value={cumulative} percentage={cumulativePercent} />
        );
      }
    },
    {
      title: (
        <span>
          {t('balance')}
          {initialBalance > 0 && (
            <>
              <br /> ${initialBalance}
            </>
          )}
        </span>
      ),
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const balance = balanceMap[record.id];
        return balance ? (
          <PositiveNegativeText
            isPositive={balance >= initialBalance}
            isNegative={balance < initialBalance}
          >
            {roundToDecimals(balance)}
          </PositiveNegativeText>
        ) : (
          '-'
        );
      }
    },
    {
      title: t('entryPrice'),
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      width: 130,
      align: 'center',
      defaultSortOrder: 'descend',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('exitPrice'),
      dataIndex: 'exitPrice',
      key: 'exitPrice',
      width: 130,
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
      title: t('StockP/L'),
      dataIndex: 'stockPL',
      key: 'stockPL',
      width: 120,
      align: 'center',
      render: (value) => {
        return value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{formatPercent(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        );
      }
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      width: 140,
      align: 'center',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={1} /> : '-'
    },
    {
      title: t('notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 160,
      align: 'center',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={1} /> : '-'
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 130,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title={isMobile ? null : t('edit')}>
            <Button
              type='primary'
              icon={
                <Icon
                  icon='edit'
                  width={18}
                  height={18}
                  fill='var(--white-color)'
                />
              }
              onClick={() => router.push(PageURLs.ofEditLedgerEntry(record.id))}
            />
          </Tooltip>
          <Tooltip title={isMobile ? null : t('delete')}>
            <Popconfirm
              placement='topRight'
              title={t('deleteConfirmationTitle')}
              description={t('deleteConfirmationDescription')}
              okText={t('yes')}
              cancelText={t('no')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                danger
                icon={<Icon icon='trash' width={18} height={18} />}
              />
            </Popconfirm>
          </Tooltip>
          <Tooltip title={isMobile ? null : t('sendAlert')}>
            <Button
              icon={
                <Icon
                  fill='var(--sky-pulse)'
                  icon='send'
                  width={18}
                  height={18}
                />
              }
              onClick={() =>
                router.push(PageURLs.ofSendAlertLedgerEntry(record.id))
              }
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const columnsTable = isMobile
    ? columns.filter((col) =>
        [
          'symbol',
          'period',
          'entryPrice',
          'exitPrice',
          'winOrLoss',
          'investment',
          'plAmount',
          'cumulative',
          'balance',
          'actions'
        ].includes(col.key as string)
      )
    : columns;

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('ledgerEntryTitle')}
        </TableTitle>
        <Space css={actionStyles}>
          <Button
            css={depositBtnStyles}
            icon={<Icon icon='deposit' width={18} height={18} />}
            onClick={() =>
              modal.openModal(<DepositWithdrawForm type='deposit' />)
            }
            type='primary'
            ghost
          >
            {t('depositMoney')}
          </Button>
          <Button
            icon={<Icon icon='withdraw' width={18} height={18} />}
            onClick={() =>
              modal.openModal(<DepositWithdrawForm type='withdraw' />)
            }
            danger
          >
            {t('withdrawMoney')}
          </Button>
          <Button
            icon={<PlusOutlined />}
            type='primary'
            onClick={() => router.push(PageURLs.ofAddLedgerEntry())}
            css={addLedgerEntryBtnStyles}
          >
            {t('addLedgerEntry')}
          </Button>
          {isDesktop && (
            <ExportExcelLedgerEntry initialBalance={initialBalance} />
          )}
        </Space>
      </div>
      <Table<LedgerEntry>
        size={isMobile ? 'small' : 'middle'}
        css={tableStyles}
        rowKey='id'
        columns={columnsTable}
        dataSource={ledgerEntry}
        loading={loading}
        scroll={{
          x: 1200,
          y: ledgerEntry.length > 0 ? height - 232 : undefined
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
  width: ${isMobile && '100%'};
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 1.2rem 1.4rem;
  gap: ${isMobile ? '2rem' : '1.4rem'};
`;

const actionStyles = css`
  flex: 1;
  justify-content: flex-end;
  width: 100%;
  position: relative;
  @media (max-width: 460px) {
    flex-wrap: ${isMobile ? 'wrap-reverse' : 'wrap'};
    gap: unset;
  }
`;

const depositBtnStyles = css`
  margin-right: 1.4rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const addLedgerEntryBtnStyles = css`
  @media (max-width: 460px) {
    position: absolute;
    top: -4.6rem;
    right: 0;
  }
`;
