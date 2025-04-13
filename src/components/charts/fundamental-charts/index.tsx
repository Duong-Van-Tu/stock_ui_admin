/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FundamentalScoreChart } from './fundamental-score.chart';
import { FundamentalScoreDetailChart } from './fundamental-score-detail.chart';
import { FundamentalDetailChart } from './fundamental-detail.chart';

type FundamentalChartsProps = {
  symbol: string;
};

export default function FundamentalCharts({ symbol }: FundamentalChartsProps) {
  return (
    <div css={rootStyles}>
      <FundamentalScoreChart symbol={symbol} />
      <FundamentalScoreDetailChart symbol={symbol} />
      <FundamentalDetailChart symbol={symbol} />
    </div>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2.6rem;
`;
