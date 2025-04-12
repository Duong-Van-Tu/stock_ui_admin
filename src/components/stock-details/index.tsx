/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppSelector } from '@/redux/hooks';
import StockOverviewChart from '../charts/stock-overview.chart';
import { useParams, useRouter } from 'next/navigation';
import { watchSearchSymbol } from '@/redux/slices/search';
import { useEffect } from 'react';
import { PageURLs } from '@/utils/navigate';
import { watchSectorLoading } from '@/redux/slices/stock-score.slice';
import { Spin } from 'antd';
import { StockDetailHeader } from './stock-details-header';
import { StatisticCard } from './stock-statistic-card';

export default function StockDetail() {
  const params = useParams();
  const symbol = params.symbol as string;
  const router = useRouter();
  const loading = useAppSelector(watchSectorLoading);
  const searchSymbol = useAppSelector(watchSearchSymbol);

  useEffect(() => {
    if (searchSymbol) {
      router.push(PageURLs.ofStockDetail(searchSymbol));
    }
  }, [searchSymbol, symbol, router]);

  return (
    <Spin spinning={loading}>
      <div css={rootStyles}>
        <StockDetailHeader />
        <div css={contentWrapperStyles}>
          <div css={chartWrapperStyles}>
            <StockOverviewChart symbol={symbol} />
          </div>
          <div css={statisticCardWrapperStyles}>
            <StatisticCard />
          </div>
        </div>
      </div>
    </Spin>
  );
}

const rootStyles = css`
  width: 100%;
`;

const contentWrapperStyles = css`
  margin-top: 1.4rem;
  display: flex;
  gap: 2rem;
`;

const chartWrapperStyles = css`
  height: auto;
  flex: 1;
`;

const statisticCardWrapperStyles = css`
  width: 38rem;
`;
