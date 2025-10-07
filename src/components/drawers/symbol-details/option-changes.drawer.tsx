/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Table, TableColumnsType } from 'antd';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { formatPercent, isNumeric, roundToDecimals } from '@/utils/common';
import {
  getOptionChanges,
  resetOptionChanges,
  watchOptionChangesData,
  watchOptionChangesLoading
} from '@/redux/slices/options-changes.slice';
import { PositiveNegativeText } from '@/components/positive-negative-text';
import { isMobile } from 'react-device-detect';
import { EmptyDataTable } from '@/components/tables/empty.table';
import { useTranslations } from 'next-intl';

type OptionChangesDrawerProps = { symbol: string };

export default function OptionChangesDrawer({
  symbol
}: OptionChangesDrawerProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const data = useAppSelector(watchOptionChangesData);
  const loading = useAppSelector(watchOptionChangesLoading);

  const fetchData = useCallback(() => {
    dispatch(getOptionChanges({ symbol }));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchData();
    return () => {
      dispatch(resetOptionChanges());
    };
  }, [fetchData, dispatch]);

  const columns: TableColumnsType<OptionChange> = [
    {
      title: 'Type',
      dataIndex: 'optionType',
      key: 'optionType',
      width: 80,
      align: 'center'
    },
    {
      title: 'Strike',
      dataIndex: 'strike',
      key: 'strike',
      width: 90,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Exp Date',
      dataIndex: 'expDate',
      key: 'expDate',
      width: 132,
      align: 'center',
      render: (v) => (
        <div
          css={css`
            min-width: 8rem;
          `}
        >
          {v}
        </div>
      )
    },
    {
      title: 'DTE',
      dataIndex: 'dte',
      key: 'dte',
      width: 90,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
    },
    {
      title: 'Ask',
      dataIndex: 'ask',
      key: 'ask',
      width: 90,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Moneyness (%)',
      dataIndex: 'moneyness',
      key: 'moneyness',
      width: 146,
      align: 'center',
      render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
    },
    {
      title: 'BE(Ask)',
      dataIndex: 'beAsk',
      key: 'beAsk',
      width: 100,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: '%BE(Ask)',
      dataIndex: 'beAskPercent',
      key: 'beAskPercent',
      width: 110,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isNegative={v < 0} isPositive={v > 0}>
            {formatPercent(v, 2)}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'Bid-Ask%',
      dataIndex: 'bidAsk',
      key: 'bidAsk',
      width: 110,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      align: 'center',
      render: (v) => roundToDecimals(v)
    },
    {
      title: 'Open Int',
      dataIndex: 'openInt',
      key: 'openInt',
      width: 110,
      align: 'center',
      render: (v) => roundToDecimals(v)
    },
    {
      title: 'Theta',
      dataIndex: 'theta',
      key: 'theta',
      width: 90,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'Delta',
      dataIndex: 'delta',
      key: 'delta',
      width: 90,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('lastPrice'),
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('currentPrice'),
      dataIndex: 'newStockPrice',
      key: 'newStockPrice',
      width: 120,
      align: 'center',
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: `${t('change')}$`,
      dataIndex: 'change',
      key: 'change',
      width: 110,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: `${t('change')}%`,
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 110,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{formatPercent(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'Delta Price Change',
      dataIndex: 'optionPriceChange',
      key: 'optionPriceChange',
      width: 170,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'New option price',
      dataIndex: 'newOptionPremium',
      key: 'newOptionPremium',
      width: 160,
      align: 'center',
      render: (v, record) =>
        isNumeric(v) ? (
          <PositiveNegativeText
            isPositive={v > record.lastOptionPrice}
            isNegative={v < record.lastOptionPrice}
          >
            {roundToDecimals(v, 2)}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: '% Profit Return',
      dataIndex: 'profitNoTheta',
      key: 'profitNoTheta',
      width: 150,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{formatPercent(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: '% Profit (with time decay)',
      dataIndex: 'profitTheta',
      key: 'profitTheta',
      width: 200,
      align: 'center',
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{formatPercent(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  return (
    <Table<OptionChange>
      css={tableStyles}
      rowClassName={(r) => (r.suggested ? 'hl-add-symbol' : '')}
      size='small'
      rowKey={(record) => record.key}
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={data.length > 0 ? { x: 1100, y: undefined } : undefined}
      pagination={false}
      locale={{
        emptyText: (
          <div css={emptyStyles}>
            <EmptyDataTable />
          </div>
        )
      }}
    />
  );
}

const tableStyles = css`
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
  .ant-table-cell {
    padding: ${isMobile
      ? '0.6rem 0.8rem !important'
      : '0.8rem 1rem !important'};
  }
`;

const emptyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
