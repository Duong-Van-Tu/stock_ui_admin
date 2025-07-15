/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Empty } from 'antd';
import BarChart from '../bar.chart';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEarningsDetails,
  watchEarningsDetails
} from '@/redux/slices/stock-details.slice';

type FundamentalDetailProps = {
  symbol: string;
};

export function EarningsDetailsChart({ symbol }: FundamentalDetailProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const earningsDetails = useAppSelector(watchEarningsDetails);

  const series = [
    { name: t('epsActual'), color: '#2e7d32' },
    { name: t('epsEstimate'), color: '#FFBF00' },
    { name: t('epsSurprise'), color: '#42a5f5' }
  ];

  const fetchEarningsSDetails = useCallback(() => {
    dispatch(getEarningsDetails(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchEarningsSDetails();
  }, [fetchEarningsSDetails]);

  return (
    <Card title={<span css={titleStyles}>{t('earningsDetailsTitle')}</span>}>
      {earningsDetails.length === 0 ? (
        <Empty css={emptyStyles} />
      ) : (
        <div css={chartContainerStyles}>
          <BarChart
            data={earningsDetails}
            series={series}
            height={350}
            grid={{ left: 60, bottom: 80 }}
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
  min-height: 35rem;
`;

const emptyStyles = css`
  height: 35rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
