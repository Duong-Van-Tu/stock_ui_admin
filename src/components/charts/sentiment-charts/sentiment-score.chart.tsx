/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card } from 'antd';
import { useCallback, useEffect } from 'react';

import GaugeChart from '../gauge.chart';
import { roundToDecimals } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getNewsScoreBySymbol,
  watchNewsScoreBySymbol
} from '@/redux/slices/sentiment.slice';

type NewsScoreProps = {
  symbol: string;
};

/* ===================== Finnhub Score ===================== */
export function FinnhubScoreChart({ symbol }: NewsScoreProps) {
  const dispatch = useAppDispatch();
  const score = useAppSelector(watchNewsScoreBySymbol);

  const fetchData = useCallback(() => {
    dispatch(getNewsScoreBySymbol({ symbol }));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!score) return null;

  return (
    <Card title={<span css={titleStyles}>Finnhub Score</span>}>
      <div css={chartsContainerStyle}>
        {[
          { value: score.finnhubScore1d, label: 'Score 1 Day' },
          { value: score.finnhubScore3d, label: 'Score 3 Days' },
          { value: score.finnhubScore1w, label: 'Score 1 Week' }
        ].map((item, index) => (
          <GaugeChart
            key={index}
            value={roundToDecimals(item.value)!}
            label={item.label}
          />
        ))}
      </div>
    </Card>
  );
}

/* ===================== LSEG Score ===================== */
export function LsegScoreChart({ symbol }: NewsScoreProps) {
  const dispatch = useAppDispatch();
  const score = useAppSelector(watchNewsScoreBySymbol);

  const fetchData = useCallback(() => {
    dispatch(getNewsScoreBySymbol({ symbol }));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!score) return null;

  return (
    <Card title={<span css={titleStyles}>LSEG Score</span>}>
      <div css={chartsContainerStyle}>
        {[
          { value: score.lsegScore1d, label: 'Score 1 Day' },
          { value: score.lsegScore3d, label: 'Score 3 Days' },
          { value: score.lsegScore1w, label: 'Score 1 Week' }
        ].map((item, index) => (
          <GaugeChart
            key={index}
            value={roundToDecimals(item.value)!}
            label={item.label}
          />
        ))}
      </div>
    </Card>
  );
}

/* ===================== Styles ===================== */
const chartsContainerStyle = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const titleStyles = css`
  font-size: 2rem;
`;
