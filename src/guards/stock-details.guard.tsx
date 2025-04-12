'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStockDetails,
  watchStockDetails,
  watchStockDetailsLoading
} from '@/redux/slices/stock-details.slice';
import StockNotFound from '@/components/stock-not-found';

type StockDetailGuardProps = {
  children: ReactNode;
};

export function StockDetailGuard({ children }: StockDetailGuardProps) {
  const dispatch = useAppDispatch();
  const params = useParams();
  const symbol = params.symbol as string;
  const loading = useAppSelector(watchStockDetailsLoading);
  const stockDetails = useAppSelector(watchStockDetails);

  const fetchStockDetail = useCallback(async () => {
    dispatch(getStockDetails(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchStockDetail();
  }, [fetchStockDetail]);

  if (!stockDetails && !loading) {
    return <StockNotFound />;
  }

  return <>{children}</>;
}
