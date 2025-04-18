/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { EarningsScore } from './earnings-score.chart';
import { EarningsScoreDetailChart } from './earnings-score-detail.chart';
import { EarningsDetailsChart } from './earnings-details.chart';

type EarningsChartsProps = {
  symbol: string;
};

export default function EarningsCharts({ symbol }: EarningsChartsProps) {
  return (
    <div css={rootStyles}>
      <EarningsScore symbol={symbol} />
      <EarningsScoreDetailChart symbol={symbol} />
      <EarningsDetailsChart symbol={symbol} />
    </div>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2.6rem;
`;
