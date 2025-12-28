/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { MovingSentimentScoreChart } from './moving-sentiment-score.chart';
import { FinnhubScoreChart, LsegScoreChart } from './sentiment-score.chart';

type SentimentChartsProps = {
  symbol: string;
};

export default function SentimentCharts({ symbol }: SentimentChartsProps) {
  return (
    <div css={rootStyles}>
      <div css={containerStyles}>
        <div css={chartWrapperStyles}>
          <FinnhubScoreChart symbol={symbol} />
        </div>
        <div css={chartWrapperStyles}>
          <LsegScoreChart symbol={symbol} />
        </div>
        <div css={chartWrapperStyles}>
          <MovingSentimentScoreChart symbol={symbol} />
        </div>
      </div>
    </div>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2.6rem;
`;

const containerStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const chartWrapperStyles = css`
  flex: 1 1 calc(50% - 1rem);
  min-width: 550px;
`;
