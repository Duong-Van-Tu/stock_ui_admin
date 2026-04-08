/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { EmptyDataTable } from '@/components/tables/empty.table';
import { Collapse, Table, TableColumnsType } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEarningsFilter,
  watchEarningsFilter,
  watchEarningsLoading
} from '@/redux/slices/earnings.slice';
import { useCallback, useEffect } from 'react';
import { PositiveNegativeText } from '@/components/positive-negative-text';
import { formatNumberShort, roundToDecimals } from '@/utils/common';
import { StockChangeCell } from '@/components/tables/columns/stock-change-cell.column';
import { DateTimeCell } from '@/components/tables/columns/date-time-cell.column';
import { isMobile } from 'react-device-detect';

type SymbolEarningsDetailProps = {
  symbol: string;
  fromDate: string;
  toDate: string;
};

export const SymbolEarningsDetail = ({
  symbol,
  fromDate,
  toDate
}: SymbolEarningsDetailProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const earnings = useAppSelector(watchEarningsFilter);
  const loading = useAppSelector(watchEarningsLoading);

  const fetchEarnings = useCallback(() => {
    dispatch(
      getEarningsFilter({
        symbol,
        fromDate,
        toDate
      })
    );
  }, [dispatch, fromDate, toDate, symbol]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const columns: TableColumnsType<Earning> = [
    {
      title: t('timestamp'),
      dataIndex: 'date',
      key: 'date',
      width: 130,
      align: 'center',
      fixed: 'left',
      render: (value) => <DateTimeCell value={value} />
    },
    {
      title: t('earningsScore'),
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 136,
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
      width: 136,
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
      width: 136,
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
      width: 136,
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
      width: 154,
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
      width: 174,
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

  const collapseItems = [
    {
      key: '1',
      label: <h5 css={titleStyles}>{t('earnings')}</h5>,
      children: (
        <Table<Earning>
          size={isMobile ? 'small' : 'middle'}
          bordered={false}
          css={tableStyles}
          loading={loading}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={earnings}
          showHeader={earnings?.length > 0}
          scroll={earnings.length > 0 ? { x: 1100, y: undefined } : undefined}
          locale={{
            emptyText: (
              <div css={emptyStyles}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={false}
        />
      )
    }
  ];

  return (
    <Collapse
      css={collapseStyles}
      defaultActiveKey={['1']}
      expandIconPosition='end'
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      items={collapseItems}
    />
  );
};

const collapseStyles = css`
  .ant-collapse-header {
    align-items: center !important;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

const tableStyles = css`
  .ant-table-header,
  .ant-table-thead > tr > th,
  .ant-table-thead > tr > td {
    background: var(--table-header-bg-color) !important;
  }

  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }

  .ant-table-thead {
    .ant-table-cell {
      background: var(--table-header-bg-color) !important;

      &.ant-table-cell-fix-left,
      &.ant-table-cell-fix-right,
      &.ant-table-cell-fix-left-last,
      &.ant-table-cell-fix-right-first {
        background: var(--table-header-bg-color) !important;
      }

      &:first-of-type {
        border-start-start-radius: 0 !important;
      }

      &:last-child {
        border-start-end-radius: 0 !important;
      }
    }
  }
`;

const emptyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const titleStyles = css`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0;
`;
