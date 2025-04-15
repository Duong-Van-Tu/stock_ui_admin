/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card } from 'antd';
import { useTranslations } from 'next-intl';
import GaugeChart from '../gauge.chart';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEarningsScore,
  watchEarningsScore
} from '@/redux/slices/stock-details.slice';
import { useCallback, useEffect } from 'react';
import { roundToDecimals } from '@/utils/common';

type EarningsScoreProps = {
  symbol: string;
};

export function EarningsScore({ symbol }: EarningsScoreProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const EarningsScore = useAppSelector(watchEarningsScore);

  const fetchEarningsScore = useCallback(() => {
    dispatch(getEarningsScore(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchEarningsScore();
  }, [fetchEarningsScore]);

  return (
    <Card title={<span css={titleStyles}>{t('earningsScore')}</span>}>
      <div css={chartsContainerStyle}>
        {[
          EarningsScore.earningsScore,
          EarningsScore.epsActualScore,
          EarningsScore.epsEstimateScore
        ].map((score, index) => (
          <GaugeChart
            key={index}
            value={roundToDecimals(score)!}
            label={
              index === 0
                ? t('earningsScore')
                : index === 1
                ? t('epsActualScore')
                : t('epsEstimateScore')
            }
          />
        ))}
      </div>
    </Card>
  );
}

const chartsContainerStyle = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const titleStyles = css`
  font-size: 2rem;
`;
