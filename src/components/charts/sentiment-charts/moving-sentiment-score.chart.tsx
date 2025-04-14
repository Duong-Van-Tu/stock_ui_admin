/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Empty, Select } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getMovingSentimentScore,
  watchMovingSentimentScore
} from '@/redux/slices/stock-details.slice';

import LineChart from '../line.chart';

type FundamentalDetailProps = {
  symbol: string;
};

const DEFAULT_RANGE = 7;
const CHART_HEIGHT = 400;
const CHART_GRID = { bottom: 80, left: 30, right: 30 };

const getRangeOptions = (t: (key: string) => string) => [
  { value: 1, label: t('1Day') },
  { value: 2, label: t('2Days') },
  { value: 3, label: t('3Days') },
  { value: 4, label: t('4Days') },
  { value: 5, label: t('5Days') },
  { value: 6, label: t('6Days') },
  { value: 7, label: t('1Week') },
  { value: 14, label: t('2Weeks') }
];

const series = [
  { name: 'Score 1 week', color: '#4caf50' },
  { name: 'Score 1 month', color: '#ffeb3b' },
  { name: 'Score 3 months', color: '#2196f3' }
];

export function MovingSentimentScoreChart({ symbol }: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const movingSentimentScores = useAppSelector(watchMovingSentimentScore);

  const [range, setRange] = useState<number>(DEFAULT_RANGE);

  const toDate = dayjs().format('YYYY-MM-DD');
  const fromDate = dayjs().subtract(range, 'day').format('YYYY-MM-DD');

  const fetchMovingSentimentScores = useCallback(() => {
    dispatch(getMovingSentimentScore({ symbol, fromDate, toDate }));
  }, [dispatch, symbol, fromDate, toDate]);

  useEffect(() => {
    fetchMovingSentimentScores();
  }, [fetchMovingSentimentScores]);

  const handleRangeChange = (value: number) => {
    setRange(value);
  };

  return (
    <Card
      title={
        <div css={headerStyles}>
          <span css={titleStyles}>{t('movingSentimentScore')}</span>
          <Select
            defaultValue={DEFAULT_RANGE}
            onChange={handleRangeChange}
            css={selectStyles}
            options={getRangeOptions(t)}
          />
        </div>
      }
    >
      {movingSentimentScores.length === 0 ? (
        <Empty css={emptyStyles} />
      ) : (
        <LineChart
          data={movingSentimentScores}
          series={series}
          height={CHART_HEIGHT}
          grid={CHART_GRID}
        />
      )}
    </Card>
  );
}

const titleStyles = css`
  font-size: 2rem;
`;

const headerStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const selectStyles = css`
  width: 10rem;
  height: 2.8rem;

  .ant-select-selector {
    background: var(--blue-100) !important;

    .ant-select-selection-item {
      font-weight: 500;
    }
  }
`;

const emptyStyles = css`
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
