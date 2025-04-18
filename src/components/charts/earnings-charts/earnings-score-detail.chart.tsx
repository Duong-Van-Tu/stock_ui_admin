/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Empty } from 'antd';
import BarChart from '../bar.chart';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEarningsDetailScore,
  watchEarningsDetailScore
} from '@/redux/slices/stock-details.slice';

type FundamentalDetailProps = {
  symbol: string;
};

export function EarningsScoreDetailChart({ symbol }: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const earningsDetails = useAppSelector(watchEarningsDetailScore);

  const series = [
    { name: t('epsActualMomentum'), color: '#2e7d32' },
    { name: t('epsActualRecent'), color: '#FFBF00' },
    { name: t('epsEstimateMomentum'), color: '#42a5f5' },
    { name: t('epsEstimateRecent'), color: '#e91e63' },
    { name: t('surpriseRecent'), color: '#ab47bc' }
  ];

  const fetchEarningsScoreDetails = useCallback(() => {
    dispatch(getEarningsDetailScore(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchEarningsScoreDetails();
  }, [fetchEarningsScoreDetails]);

  return (
    <Card
      title={<span css={titleStyles}>{t('earningsDetailScoreTitle')}</span>}
    >
      {earningsDetails.length === 0 ? (
        <Empty css={emptyStyles} />
      ) : (
        <BarChart
          data={earningsDetails}
          series={series}
          height={350}
          grid={{ left: 60, bottom: 80 }}
        />
      )}
    </Card>
  );
}

const titleStyles = css`
  font-size: 2rem;
`;

const emptyStyles = css`
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
