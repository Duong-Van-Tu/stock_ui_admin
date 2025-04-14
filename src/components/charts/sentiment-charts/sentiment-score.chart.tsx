/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card } from 'antd';
import { useTranslations } from 'next-intl';
import GaugeChart from '../gauge.chart';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getSentimentScore,
  watchSentimentScore
} from '@/redux/slices/stock-details.slice';
import { useCallback, useEffect } from 'react';
import { roundToDecimals } from '@/utils/common';

type SentimentScoreProps = {
  symbol: string;
};

export function SentimentScoreChart({ symbol }: SentimentScoreProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const SentimentScore = useAppSelector(watchSentimentScore);

  const fetchSentimentScore = useCallback(() => {
    dispatch(getSentimentScore(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchSentimentScore();
  }, [fetchSentimentScore]);

  return (
    <Card title={<span css={titleStyles}>{t('sentimentScore')}</span>}>
      <div css={chartsContainerStyle}>
        {[
          SentimentScore.score1w,
          SentimentScore.score1m,
          SentimentScore.score3m
        ].map((score, index) => (
          <GaugeChart
            key={index}
            value={roundToDecimals(score)!}
            label={
              index === 0
                ? t('score1w')
                : index === 1
                ? t('score1m')
                : t('score3m')
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
