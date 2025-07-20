/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Empty } from 'antd';
import BarChart from '../bar.chart';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getFundamentalDetails,
  watchFundamentalDetails
} from '@/redux/slices/stock-details.slice';

type FundamentalDetailProps = {
  symbol: string;
};

export function FundamentalDetailChart({ symbol }: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const fundamentalDetails = useAppSelector(watchFundamentalDetails);

  const series = [
    { name: t('ebit'), color: '#2e7d32' },
    { name: t('grossIncome'), color: '#FFBF00' },
    { name: t('netIncome'), color: '#64b5f6' },
    { name: t('revenue'), color: '#fb8c00' }
  ];

  const fetchFundamentalDetails = useCallback(() => {
    dispatch(getFundamentalDetails(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchFundamentalDetails();
  }, [fetchFundamentalDetails]);

  return (
    <Card title={<span css={titleStyles}>{t('fundamentalDetailTitle')}</span>}>
      <div css={chartContainerStyles}>
        {fundamentalDetails.length === 0 ? (
          <Empty css={emptyStyles} />
        ) : (
          <div css={chartContainerStyles}>
            <BarChart
              data={fundamentalDetails}
              series={series}
              height={350}
              grid={{ left: 80, right: 10 }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

const titleStyles = css`
  font-size: 2rem;
`;

const chartContainerStyles = css`
  min-height: 35rem;
`;

const emptyStyles = css`
  height: 35rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
