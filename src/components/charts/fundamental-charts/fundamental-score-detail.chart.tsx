/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Empty } from 'antd';
import BarChart from '../bar.chart';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getFundamentalDetailScore,
  watchFundamentalDetailScore
} from '@/redux/slices/stock-details.slice';

type FundamentalDetailProps = {
  symbol: string;
};

export function FundamentalScoreDetailChart({
  symbol
}: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const fundamentalDetailSCore = useAppSelector(watchFundamentalDetailScore);

  const series = [
    // EBIT
    { name: t('ebitMomentum'), color: '#1ba622' },
    { name: t('ebitRecent'), color: '#77dd7d', enabled: false },

    // Gross Income
    { name: t('grossIncomeMomentum'), color: '#1976d2' },
    { name: t('grossIncomeRecent'), color: '#64b0ef', enabled: false },

    // Net Income
    { name: t('netIncomeMomentum'), color: '#fc4689' },
    { name: t('netIncomeRecent'), color: '#ff8bb9', enabled: false },

    // Revenue
    { name: t('revenueMomentum'), color: '#f57c00' },
    { name: t('revenueRecent'), color: '#f8b95b', enabled: false },

    // Net Margin
    { name: t('netMarginMomentum'), color: '#017c6e' },
    { name: t('netMarginRecent'), color: '#12bcab', enabled: false }
  ];

  const fetchFundamentalScoreDetails = useCallback(() => {
    dispatch(getFundamentalDetailScore(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchFundamentalScoreDetails();
  }, [fetchFundamentalScoreDetails]);

  return (
    <Card
      title={<span css={titleStyles}>{t('fundamentalDetailScoreTitle')}</span>}
    >
      {fundamentalDetailSCore.length === 0 ? (
        <Empty css={emptyStyles} />
      ) : (
        <div css={chartContainerStyles}>
          <BarChart
            data={fundamentalDetailSCore}
            series={series}
            height={400}
            grid={{ bottom: 80, left: 40 }}
          />
        </div>
      )}
    </Card>
  );
}

const titleStyles = css`
  font-size: 2rem;
`;

const chartContainerStyles = css`
  min-height: 40rem;
`;

const emptyStyles = css`
  height: 40rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
