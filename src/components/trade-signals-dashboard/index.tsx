/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useCallback } from 'react';
import { Card, Table, Typography, Skeleton, Row, Col } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading
} from '@/redux/slices/signals.slice';
import { StrategySignal } from './strategy-signal';

export default function TradeSignalsDashboard() {
  const dispatch = useAppDispatch();
  const strategies = useAppSelector(watchStrategies);
  const loading = useAppSelector(watchStrategyLoading);

  const fetchStrategies = useCallback(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const chunkArray = (arr: any[], size: number) => {
    return arr.length > 0
      ? Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size)
        )
      : [];
  };

  const rows = chunkArray(loading ? Array.from({ length: 9 }) : strategies, 3);

  return (
    <div css={rootStyles}>
      {rows.map((row, rowIndex) => (
        <Row gutter={[16, 16]} key={rowIndex}>
          {row.map((strategy: Strategy, colIndex) => (
            <Col xs={24} md={12} lg={8} key={colIndex}>
              <Card
                css={cardStyles}
                title={
                  !loading && (
                    <Typography.Text strong>{strategy.name}</Typography.Text>
                  )
                }
              >
                {loading ? (
                  <Skeleton active />
                ) : (
                  <StrategySignal strategyId={strategy.id} />
                )}
              </Card>
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );
}

const rootStyles = css``;

const cardStyles = css`
  width: 100%;
`;
