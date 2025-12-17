/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchEstForecastLoading,
  watchEstForecastList,
  getEstForecastFilter,
  addEstForecast
} from '@/redux/slices/est-forecast.slice';
import { Table, TableColumnsType, Button, DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatMarketCap, isNumeric, roundToDecimals } from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { isMobile } from 'react-device-detect';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PageURLs } from '@/utils/navigate';
import { useTranslations } from 'next-intl';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { PlusOutlined } from '@ant-design/icons';

export const EstForecastTable = () => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { height } = useWindowSize();

  const loading = useAppSelector(watchEstForecastLoading);
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
    [dispatch, createdDates]
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
      { title: 'Company', dataIndex: 'company', width: 200 },
      { title: 'Industry', dataIndex: 'industry', width: 160 },
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

  const hasSymbol = Boolean(symbol);

  return (
    <Spin spinning={loading}>
      <div css={rootStyles}>
        <div css={tableWrapperStyles}>
          <div css={titleRowStyles}>
            <TableTitle>Est Forecast</TableTitle>
            <Button
              type='primary'
              css={viewSelectedButtonStyles}
              onClick={() => router.push(PageURLs.ofEstForecastSelected())}
            >
              View selected symbols
            </Button>
          </div>

          {hasSymbol && list.length > 0 ? (
            <Table
              size={isMobile ? 'small' : 'middle'}
              css={tableStyles}
              rowKey={(record) => record.key!}
              columns={columns}
              dataSource={list}
              loading={loading}
              scroll={{
                x: 2000,
                y: list.length > 0 ? height - 240 : undefined
              }}
              pagination={false}
            />
          ) : (
            <div css={emptyStyles(height - 300)}>
              <EmptyDataTable />
            </div>
          )}
        </div>
      </div>
    </Spin>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const titleRowStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
`;

const viewSelectedButtonStyles = css`
  margin-left: 12px;
  font-size: 14px;
  font-weight: 500;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const emptyStyles = (height: number) => css`
  border-top: 1px solid var(--border-table-color);
  height: ${height}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
