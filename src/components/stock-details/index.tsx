/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import StockOverviewChart from '../charts/stock-overview.chart';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { watchSearchSymbol } from '@/redux/slices/search';
import { useEffect, useRef } from 'react';
import { PageURLs } from '@/utils/navigate';
import { watchSectorLoading } from '@/redux/slices/stock-score.slice';
import { Spin } from 'antd';
import { StockDetailHeader } from './stock-details-header';
import { StatisticCard } from './stock-statistic-card';
import { StockDetailTabs } from './stock-detail-tabs';
import { getSignalById } from '@/redux/slices/signals.slice';

export default function StockDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const symbol = params.symbol as string;
  const signalId = Number(searchParams.get('signalId')) ?? null;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const tabWrapperRef = useRef<HTMLDivElement>(null);
  const loading = useAppSelector(watchSectorLoading);
  const searchSymbol = useAppSelector(watchSearchSymbol);

  const scrollToTabs = () => {
    setTimeout(() => {
      if (!tabWrapperRef.current) return;

      const elementRect = tabWrapperRef.current.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;
      const headerOffset = 64;

      window.scrollTo({
        top: absoluteElementTop - headerOffset,
        behavior: 'smooth'
      });
    }, 100);
  };

  useEffect(() => {
    if (searchSymbol) {
      router.push(PageURLs.ofStockDetail(searchSymbol));
    }
  }, [searchSymbol, router]);

  useEffect(() => {
    if (signalId) {
      dispatch(getSignalById(signalId));
    }
  }, [signalId, dispatch]);

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
        <div css={tabWrapperStyles} ref={tabWrapperRef}>
          <StockDetailTabs symbol={symbol} onTabChange={scrollToTabs} />
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

const tabWrapperStyles = css`
  margin-top: 3rem;
`;
