/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card } from 'antd';
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

export default function FundamentalScoreDetailChart({
  symbol
}: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const fundamentalDetailSCore = useAppSelector(watchFundamentalDetailScore);

  const series = [
    { name: t('ebitMomentum'), color: '#2e7d32' },
    { name: t('ebitRecent'), color: '#FFBF00' },
    { name: t('grossIncomeMomentum'), color: '#2196f3' },
    { name: t('grossIncomeRecent'), color: '#e91e63' },
    { name: t('netIncomeMomentum'), color: '#9c27b0' },
    { name: t('netIncomeRecent'), color: '#ff5722' },
    { name: t('revenueMomentum'), color: '#795548' },
    { name: t('revenueRecent'), color: '#00bcd4' },
    { name: t('netMarginMomentum'), color: '#3f51b5' },
    { name: t('netMarginRecent'), color: '#009688' }
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
      <BarChart
        data={fundamentalDetailSCore}
        series={series}
        height={400}
        grid={{ bottom: 80, left: 40 }}
      />
    </Card>
  );
}

const titleStyles = css`
  font-size: 2rem;
`;
