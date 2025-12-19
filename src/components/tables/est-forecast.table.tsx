/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchEstForecastListLoading,
  watchEstForecastList,
  getEstForecastFilter,
  addEstForecast
} from '@/redux/slices/est-forecast.slice';
import { Table, TableColumnsType, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatMarketCap, isNumeric, roundToDecimals } from '@/utils/common';
import { isMobile } from 'react-device-detect';
import { DateTimeCell } from './columns/date-time-cell.column';
import { useTranslations } from 'next-intl';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { PlusOutlined } from '@ant-design/icons';
import { useModal } from '@/hooks/modal.hook';

type EstForecastTableProps = {
  symbol: string;
};
export const EstForecastTable = ({ symbol }: EstForecastTableProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();

  const loading = useAppSelector(watchEstForecastListLoading);
  const list = useAppSelector(watchEstForecastList);

  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
  const [createdDates, setCreatedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    setAddedSymbols(new Set());
    setCreatedDates({});

    if (symbol) {
      dispatch(
        getEstForecastFilter({
          symbol
        })
      );
    }

    return () => {
      dispatch(resetState());
    };
  }, [dispatch, symbol]);

  const handleAdd = useCallback(
    (record: EstForecast) => {
      setAddedSymbols((prev) => new Set(prev).add(record.symbol));
      closeModal();
      dispatch(
        addEstForecast({
          symbol: record.symbol,
          company: record.company,
          industry: record.industry,
          callTime: record.callTime,
          beta: record.beta,
          marketCapEstForecast: record.marketCapEstForecast,
          result: record.result,
          epsEstimate: record.epsEstimate,
          reportedEps: record.reportedEps,
          surprise: record.surprise,
          prevEstimate: record.prevEstimate,
          ytdPerformance: record.ytdPerformance,
          aiRating: record.aiRating,
          totalScoreEstForecast: record.totalScoreEstForecast,
          routerRec: record.routerRec,
          yahooRec: record.yahooRec,
          priceTarget: record.priceTarget,
          grok: record.grok,
          gpt: record.gpt,
          forecast: record.forecast,
          createdAt: createdDates[record.symbol]
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [closeModal, dispatch, createdDates]
  );

  const columns: TableColumnsType<EstForecast> = useMemo(
    () => [
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        key: 'symbol',
        width: isMobile ? 110 : 160,
        fixed: 'left',
        render: (_, record) => (
          <SymbolCell
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
          />
        )
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        width: 204,
        align: 'center',
        render: (_, record) =>
          addedSymbols.has(record.symbol) ? (
            <DateTimeCell value={createdDates[record.symbol]} />
          ) : (
            <DatePicker
              showTime
              value={
                createdDates[record.symbol]
                  ? dayjs(createdDates[record.symbol])
                  : null
              }
              onChange={(d) =>
                setCreatedDates((prev) => ({
                  ...prev,
                  [record.symbol]: d ? d.toISOString() : ''
                }))
              }
            />
          )
      },
      { title: 'Industry', dataIndex: 'industry', width: 160, align: 'center' },
      {
        title: 'Beta',
        dataIndex: 'beta',
        width: 80,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Market Cap',
        dataIndex: 'marketCapEstForecast',
        width: 130,
        align: 'center',
        render: (v) => (v ? formatMarketCap(v / 1_000_000) : '-')
      },
      {
        title: t('epsEstimate'),
        dataIndex: 'epsEstimate',
        width: 120,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
              {roundToDecimals(v, 2)}
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: t('epsActual'),
        dataIndex: 'reportedEps',
        width: 120,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
              {roundToDecimals(v, 2)}
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Surprise',
        dataIndex: 'surprise',
        width: 110,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'YTD %',
        dataIndex: 'ytdPerformance',
        width: 110,
        align: 'center',
        render: (value) =>
          value ? (
            <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
              <span>{roundToDecimals(value, 2)}%</span>
            </PositiveNegativeText>
          ) : (
            <span>-</span>
          )
      },
      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: t('aiRating'),
        dataIndex: 'aiRating',
        width: 100,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
      },
      {
        title: t('totalScore'),
        dataIndex: 'totalScoreEstForecast',
        width: 120,
        align: 'center',
        render: (value) =>
          isNumeric(value) ? (
            <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
              <span>{roundToDecimals(value, 2)}</span>
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Yahoo Rec',
        dataIndex: 'yahooRec',
        align: 'center',
        width: 160
      },
      {
        title: 'Actions',
        width: 100,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (_, record) =>
          addedSymbols.has(record.symbol) ? null : (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => handleAdd(record)}
            >
              Add
            </Button>
          )
      }
    ],
    [t, handleAdd, addedSymbols, createdDates]
  );

  return (
    <div css={rootStyles}>
      <h1>Search results</h1>
      <Table
        size={isMobile ? 'small' : 'middle'}
        css={tableStyles}
        rowKey={(record) => record.key!}
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{
          x: 2000,
          y: undefined
        }}
        pagination={false}
      />
    </div>
  );
};

const rootStyles = css`
  h1 {
    text-align: center;
    font-size: 2.8rem;
    font-weight: 600;
  }
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;
