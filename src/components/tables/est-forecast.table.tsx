/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchEstForecastListLoading,
  watchEstForecastList,
  getEstForecastFilter,
  addEstForecast,
  watchEstForecastAdding,
  watchEstForecastAddSuccess
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
  defaultEarningsDate?: string;
};

const FALLBACK_ROW_KEY_PREFIX = 'fallback-symbol-';

export const EstForecastTable = ({
  symbol,
  defaultEarningsDate
}: EstForecastTableProps) => {
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();

  const loading = useAppSelector(watchEstForecastListLoading);
  const list = useAppSelector(watchEstForecastList);
  const adding = useAppSelector(watchEstForecastAdding);
  const addSuccess = useAppSelector(watchEstForecastAddSuccess);

  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
  const [createdDates, setCreatedDates] = useState<Record<string, string>>({});

  const normalizedSymbol = useMemo(() => symbol.trim().toUpperCase(), [symbol]);
  const initialEarningsDate = useMemo(
    () => defaultEarningsDate || dayjs().format('YYYY-MM-DD'),
    [defaultEarningsDate]
  );

  useEffect(() => {
    if (addSuccess) {
      closeModal();
    }
  }, [addSuccess, closeModal]);

  useEffect(() => {
    setAddedSymbols(new Set());
    setCreatedDates({});
    if (symbol) {
      dispatch(getEstForecastFilter({ symbol }));
    }
  }, [dispatch, symbol]);

  const handleAddBySymbol = useCallback(
    (symbolToAdd: string) => {
      const normalizedSymbolToAdd = symbolToAdd.trim().toUpperCase();
      if (!normalizedSymbolToAdd) return;

      setAddedSymbols((prev) => new Set(prev).add(normalizedSymbolToAdd));
      dispatch(
        addEstForecast({
          symbol: normalizedSymbolToAdd,
          earningsDate: createdDates[normalizedSymbolToAdd]
            ? dayjs(createdDates[normalizedSymbolToAdd]).format('YYYY-MM-DD')
            : initialEarningsDate,
          type: 'call'
        } as EstForecast)
      );
    },
    [dispatch, createdDates, initialEarningsDate]
  );

  const dataSource = useMemo<EstForecast[]>(() => {
    if (list.length > 0) return list;
    if (!normalizedSymbol) return [];

    return [
      {
        key: `${FALLBACK_ROW_KEY_PREFIX}${normalizedSymbol}`,
        symbol: normalizedSymbol,
        company: '',
        earningsDate: initialEarningsDate,
        type: 'call'
      } as EstForecast
    ];
  }, [list, normalizedSymbol, initialEarningsDate]);

  const handleAdd = useCallback(
    (record: EstForecast) => {
      setAddedSymbols((prev) => new Set(prev).add(record.symbol));
      dispatch(
        addEstForecast({
          ...record,
          epsBeatFreq: record.epsBeatFreq,
          epsBeatFreqPoint: record.epsBeatFreqPoint
            ? Number(record.epsBeatFreqPoint)
            : null,
          revenueBeatFreq: record.revenueBeatFreq,
          revenueBeatFreqPoint: record.revenueBeatFreqPoint
            ? Number(record.revenueBeatFreqPoint)
            : null,
          gptRating: record.gptRating ? Number(record.gptRating) : null,
          gptRatingPoint: record.gptRatingPoint
            ? Number(record.gptRatingPoint)
            : null,
          lsegNewsTotalScorePoint: record.lsegNewsTotalScorePoint
            ? Number(record.lsegNewsTotalScorePoint)
            : null,
          earningsDate: createdDates[record.symbol]
            ? dayjs(createdDates[record.symbol]).format('YYYY-MM-DD')
            : record.earningsDate,
          type: 'call'
        })
      );
      // Don't close modal immediately - let useEffect handle it
    },
    [dispatch, createdDates]
  );

  const columns: TableColumnsType<EstForecast> = useMemo(
    () => [
      {
        title: 'Symbol',
        dataIndex: 'symbol',
        key: 'symbol',
        width: isMobile ? 110 : 200,
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
      {
        title: 'Industry',
        dataIndex: 'industry',
        width: 180,
        align: 'center',
        render: (v) => (v ? v : '-')
      },
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
        title: (
          <>
            Revenue Forecast <br /> (YoY Growth % / Predicted Surprise %)
          </>
        ),
        dataIndex: 'revenueForecast',
        width: 280,
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
        width: 220,
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
        width: 240,
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
        width: 220,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'EPS Beat Freq',
        dataIndex: 'epsBeatFreq',
        width: 160,
        align: 'center',
        render: (v) => v || '-'
      },
      {
        title: 'EPS Beat Freq Point',
        dataIndex: 'epsBeatFreqPoint',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: (
          <>
            Avg Surprise Magnitude <br /> (Prev 6 earnings)
          </>
        ),
        dataIndex: 'avgSurpriseMagnitude',
        width: 280,
        align: 'center',
        render: (v) => v || '-'
      },
      {
        title: 'Revenue Beat Freq',
        dataIndex: 'revenueBeatFreq',
        width: 170,
        align: 'center',
        render: (v) => v || '-'
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
        width: 240,
        align: 'center',
        render: (v) => v || '-'
      },
      {
        title: 'Performance (YTD)',
        dataIndex: 'ytdPerformance',
        width: 160,
        align: 'center',
        render: (v) => v || '-'
      },
      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        width: 140,
        align: 'center',
        render: (v) => v || '-'
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
        title: (
          <>
            LSEG News <br /> Score (1D)
          </>
        ),
        dataIndex: 'lsegNewsScore1d',
        width: 100,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 3) : '-')
      },
      {
        title: (
          <>
            LSEG News <br /> Total Score Point
          </>
        ),
        dataIndex: 'lsegNewsTotalScorePoint',
        width: 148,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: (
          <>
            LSEG News <br /> Score (3D)
          </>
        ),
        dataIndex: 'lsegNewsScore3d',
        width: 100,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 3) : '-')
      },
      {
        title: 'Any Article in 12h',
        dataIndex: 'article12h',
        width: 160,
        align: 'center',
        render: (v) => (isNumeric(v) ? v : '-')
      },
      {
        title: 'MP EarningsDirection',
        dataIndex: 'marketpsychEarningsDirectionZ',
        width: 170,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP EarningsDirection Point',
        dataIndex: 'marketpsychEarningsDirectionZPoint',
        width: 210,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP EarningsForecast',
        dataIndex: 'marketpsychEarningsForecastZ',
        width: 180,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP EarningsForecast Point',
        dataIndex: 'marketpsychEarningsForecastZPoint',
        width: 210,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP RevenueDirection',
        dataIndex: 'marketpsychRevenueDirectionZ',
        width: 200,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP RevenueForecast',
        dataIndex: 'marketpsychRevenueForecastZ',
        width: 200,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP PriceUp',
        dataIndex: 'marketpsychPriceUpZ',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP Optimism',
        dataIndex: 'marketpsychOptimismZ',
        width: 128,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: 'MP Trust',
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
        render: (_, record) => {
          const isFallbackRow = String(record.key || '').startsWith(
            FALLBACK_ROW_KEY_PREFIX
          );

          return addedSymbols.has(record.symbol) ? null : (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() =>
                isFallbackRow
                  ? handleAddBySymbol(record.symbol)
                  : handleAdd(record)
              }
              loading={adding}
            >
              Add
            </Button>
          );
        }
      }
    ],
    [handleAdd, handleAddBySymbol, addedSymbols, createdDates, adding]
  );

  return (
    <div css={rootStyles}>
      <h1>Search results</h1>
      <Table
        size={isMobile ? 'small' : 'middle'}
        css={tableStyles}
        rowKey={(record) => record.key || record.symbol}
        columns={columns}
        dataSource={dataSource}
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
