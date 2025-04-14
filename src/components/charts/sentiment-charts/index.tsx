/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SentimentScoreChart } from './sentiment-score.chart';
import { MovingSentimentScoreChart } from './moving-sentiment-score.chart';
// import { NewDetails } from '@/components/drawers/symbol-details.drawer/news-details';
// import { Card } from 'antd';
// import { useTranslations } from 'next-intl';

type FundamentalChartsProps = {
  symbol: string;
};

export default function SentimentCharts({ symbol }: FundamentalChartsProps) {
  // const t = useTranslations();
  return (
    <div css={rootStyles}>
      <div css={containerStyles}>
        <div css={chartWrapperStyles}>
          <SentimentScoreChart symbol={symbol} />
        </div>
        <div css={chartWrapperStyles}>
          <MovingSentimentScoreChart symbol={symbol} />
        </div>
      </div>
      {/* <Card
        css={cardStyles}
        title={<span css={titleStyles}>{t('newsDetail')}</span>}
      ></Card> */}
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

// const cardStyles = css``;

// const titleStyles = css`
//   font-size: 2rem;
// `;
