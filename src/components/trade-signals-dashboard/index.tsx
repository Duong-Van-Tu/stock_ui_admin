/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getStrategies, watchStrategies } from '@/redux/slices/signals.slice';
import { StrategySignal } from './strategy-signal';

export default function TradeSignalsDashboard() {
  const dispatch = useAppDispatch();
  const strategies = useAppSelector(watchStrategies);

  const fetchStrategies = useCallback(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  return (
    <div css={gridStyles}>
      {strategies.map((strategy, index) => (
        <div key={index} css={cardWrapperStyles}>
          <StrategySignal
            strategyId={strategy.id}
            strategyName={strategy.name}
          />
        </div>
      ))}
    </div>
  );
}

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
