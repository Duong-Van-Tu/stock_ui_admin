/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading
} from '@/redux/slices/signals.slice';
import { StrategySignal } from './strategy-signal';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { OptionSignal } from './options-signal';

export default function TradeSignalsDashboard() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const strategies = useAppSelector(watchStrategies);
  const loading = useAppSelector(watchStrategyLoading);

  const fetchStrategies = useCallback(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return (
    <div css={rootStyles}>
      <Typography.Title css={titleStyles} level={2}>
        {t('tradeSignalsDashboard')}
      </Typography.Title>
      <div css={gridStyles}>
        {strategies.map((strategy) => (
          <div key={strategy.id} css={cardWrapperStyles}>
            <StrategySignal
              strategyId={strategy.id}
              strategyName={strategy.name}
            />
          </div>
        ))}
        {!loading && (
          <div css={cardWrapperStyles}>
            <OptionSignal />
          </div>
        )}
      </div>
    </div>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const titleStyles = css`
  text-align: center;
`;

const gridStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 2.2rem;
  justify-content: center;

  @media (min-width: 1500px) {
    & > div {
      width: calc(100% / 3 - 1.5rem);
    }
  }

  @media (min-width: 1000px) and (max-width: 1499px) {
    & > div {
      width: calc(100% / 2 - 1.5rem);
    }
  }

  @media (max-width: 999px) {
    & > div {
      width: 100%;
    }
  }
`;

const cardWrapperStyles = css`
  display: flex;
  justify-content: center;
`;
