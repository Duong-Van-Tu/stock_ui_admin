/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchEstForecastListLoading,
  watchEstForecastList,
  getEstForecastFilter,
  addEstForecast
} from '@/redux/slices/est-forecast.slice';
import { Table, TableColumnsType, Button, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatMarketCap,
  formatNumberShort,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { isMobile } from 'react-device-detect';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { PlusOutlined } from '@ant-design/icons';
import { useModal } from '@/hooks/modal.hook';
import EllipsisText from '../ellipsis-text';
import { PageURLs } from '@/utils/navigate';

type EstForecastTableProps = {
  symbol: string;
};

export const EstForecastTable = ({ symbol }: EstForecastTableProps) => {
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
      dispatch(getEstForecastFilter({ symbol }));
    }
  }, [dispatch, symbol]);

  const handleAdd = useCallback(
    (record: EstForecast) => {
      setAddedSymbols((prev) => new Set(prev).add(record.symbol));
      dispatch(
        addEstForecast({
          ...record,
          epsBeatFreq: Number(record.epsBeatFreq || 0),
          epsBeatFreqPoint: Number(record.epsBeatFreqPoint || 0),
          revenueBeatFreq: Number(record.revenueBeatFreq || 0),
          revenueBeatFreqPoint: Number(record.revenueBeatFreqPoint || 0),
          gptRating: Number(record.gptRating || 0),
          gptRatingPoint: Number(record.gptRatingPoint || 0),
          lsegNewsTotalScorePoint: Number(record.lsegNewsTotalScorePoint || 0),
          earningsDate: createdDates[record.symbol]
            ? dayjs(createdDates[record.symbol]).format('YYYY-MM-DD')
            : record.earningsDate
        })
      );
      closeModal();
    },
    [closeModal, dispatch, createdDates]
  );

  const columns: TableColumnsType<EstForecast> = useMemo(
    () => [
      {
        title: 'Symbol',
        dataIndex: 'symbol',
        key: 'symbol',
        width: isMobile ? 110 : 160,
        fixed: 'left',
        render: (_, record) => (
          <SymbolCell
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
            link={`${PageURLs.ofFinnhubLsegNews()}?symbol=${record.symbol}`}
          />
        )
      },
      {
        title: 'Earnings Date',
        dataIndex: 'earningsDate',
        width: 150,
        align: 'center',
        render: (_, record) => {
          console.log('Record Symbol:', record.symbol);
          return addedSymbols.has(record.symbol) ? (
            <DateTimeCell
              value={createdDates[record.symbol] || record.earningsDate || ''}
            />
          ) : (
            <DatePicker
              value={
                createdDates[record.symbol]
                  ? dayjs(createdDates[record.symbol])
                  : record.earningsDate
                  ? dayjs(record.earningsDate)
                  : null
              }
              onChange={(d) => {
                const formattedDate = d ? d.format('YYYY-MM-DD HH:mm:ss') : '';
                console.log(
                  `Updated Date for ${record.symbol}:`,
                  formattedDate
                );
                setCreatedDates((prev) => ({
                  ...prev,
                  [record.symbol]: formattedDate
                }));
              }}
            />
          );
        }
      },
      { title: 'Industry', dataIndex: 'industry', width: 180, align: 'center' },
      {
        title: 'Market CAP',
        dataIndex: 'marketCapEstForecast',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? formatMarketCap(v / 1_000_000) : '-')
      },
      {
        title: 'Call Time',
        dataIndex: 'callTime',
        width: 120,
        align: 'center',
        render: (v) => (v ? v : '-')
      },
      {
        title: 'Beta',
        dataIndex: 'beta',
        width: 80,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Revenue Forecast (YoY Growth % / Predicted Surprise %)',
        dataIndex: 'revenueForecast',
        width: 260,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
              {formatNumberShort(v)}
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Net Margin / Change Y/Y',
        dataIndex: 'netMargin',
        width: 200,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
              {roundToDecimals(v, 2)}%
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'EPS Estimate',
        dataIndex: 'epsEstimateESTEarnings',
        width: 130,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'EPS Trend (Current vs 30days)',
        dataIndex: 'epsTrend',
        width: 180,
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
        title: 'Beat Freq (Prev 6 earnings)',
        dataIndex: 'beatFreq',
        width: 200,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'EPS Beat Freq',
        dataIndex: 'epsBeatFreq',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'EPS Beat Freq Point',
        dataIndex: 'epsBeatFreqPoint',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Avg Surprise Magnitude (Prev 6 earnings)',
        dataIndex: 'avgSurpriseMagnitude',
        width: 200,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Revenue Beat Freq',
        dataIndex: 'revenueBeatFreq',
        width: 170,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'Revenue Beat Freq Point',
        dataIndex: 'revenueBeatFreqPoint',
        width: 200,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Post-earning Drift (1D/1W)',
        dataIndex: 'postEarningDrift',
        width: 220,
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
        title: 'Performance (YTD)',
        dataIndex: 'ytdPerformance',
        width: 160,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
              {roundToDecimals(v, 2)}%
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'AI Rating (Grok)',
        dataIndex: 'aiRating',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      { title: 'Grok Predict', dataIndex: 'grok', width: 160, align: 'center' },
      { title: 'GPT Predict', dataIndex: 'gpt', width: 160, align: 'center' },
      {
        title: 'GPT Rating',
        dataIndex: 'gptRating',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'GPT Rating Point',
        dataIndex: 'gptRatingPoint',
        width: 170,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'LSEG News Score (1D)',
        dataIndex: 'lsegNewsScore1d',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 3) : '-')
      },
      {
        title: 'LSEG News Total Score Point',
        dataIndex: 'lsegNewsTotalScorePoint',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'LSEG News Score (3D)',
        dataIndex: 'lsegNewsScore3d',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 3) : '-')
      },
      {
        title: 'Any Article in 12h',
        dataIndex: 'article12h',
        width: 140,
        align: 'center',
        render: (v) => (isNumeric(v) ? v : '-')
      },
      {
        title: 'MarketPsych EarningsDirection Z',
        dataIndex: 'marketpsychEarningsDirectionZ',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych EarningsDirection Z Point',
        dataIndex: 'marketpsychEarningsDirectionZPoint',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych EarningsForecast Z',
        dataIndex: 'marketpsychEarningsForecastZ',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych EarningsForecast Z Point',
        dataIndex: 'marketpsychEarningsForecastZPoint',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych RevenueDirection Z',
        dataIndex: 'marketpsychRevenueDirectionZ',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych RevenueForecast Z',
        dataIndex: 'marketpsychRevenueForecastZ',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych PriceUp Z',
        dataIndex: 'marketpsychPriceUpZ',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych Optimism Z',
        dataIndex: 'marketpsychOptimismZ',
        width: 128,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MarketPsych Trust Z',
        dataIndex: 'marketpsychTrustZ',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'Aggregate Score',
        dataIndex: 'aggregateScore',
        width: 138,
        align: 'center',
        render: (v) =>
          isNumeric(v) ? (
            <PositiveNegativeText isPositive={v > 7} isNegative={v < 4}>
              {roundToDecimals(v, 2)}
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Note for Trader',
        dataIndex: 'noteForTrader',
        width: 130,
        align: 'center',
        render: (v) => (v ? <EllipsisText text={v} maxLines={2} /> : '-')
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
    [handleAdd, addedSymbols, createdDates]
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
        scroll={{ x: 1200 }}
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
