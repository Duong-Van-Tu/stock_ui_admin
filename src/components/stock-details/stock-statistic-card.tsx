/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Row, Col, Typography, Divider } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import { watchStockDetails } from '@/redux/slices/stock-details.slice';
import {
  formatMarketCap,
  formatNumberShort,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from '../positive-negative-text';
import dayjs from 'dayjs';

const { Text } = Typography;

const renderValue = (
  value?: number,
  {
    suffix = '',
    isPercent = false,
    compareTo
  }: { suffix?: string; isPercent?: boolean; compareTo?: number } = {}
) => {
  if (value === undefined || value === null) return '--';

  const display = isPercent
    ? formatPercent(value)
    : roundToDecimals(value) + suffix;

  return (
    <PositiveNegativeText
      isPositive={compareTo !== undefined ? value >= compareTo : value > 0}
      isNegative={compareTo !== undefined ? value < compareTo : value < 0}
    >
      <span>{display}</span>
    </PositiveNegativeText>
  );
};

const renderDate = (value?: string) =>
  value ? dayjs(value).format('MM/DD/YYYY HH:mm:ss') : '--';

const StatRow = ({
  label,
  value
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <>
    <Col span={12} css={colLeftStyles}>
      <Text type='secondary' strong>
        {label}
      </Text>
    </Col>
    <Col span={12} css={colRightStyles}>
      {value}
    </Col>
  </>
);

export const StatisticCard = () => {
  const stockDetails = useAppSelector(watchStockDetails);

  const {
    marketCap,
    marketCapTitle,
    volume,
    atr,
    beta,
    dividendYieldIndicatedAnnual,
    ytd,
    lm,
    lw,
    week52Low,
    week52High,
    entryDate,
    entryPrice,
    exitDate,
    exitPrice
  } = stockDetails || {};

  return (
    <Card title='Statistic' bordered size='small' css={cardStyle}>
      <Row gutter={[8, 8]}>
        <StatRow
          label='Market Cap (intraday)'
          value={
            marketCap ? (
              <>
                {formatMarketCap(marketCap)}&nbsp;({marketCapTitle || '--'})
              </>
            ) : (
              '--'
            )
          }
        />
        <StatRow
          label='Volume'
          value={volume ? formatNumberShort(volume) : '--'}
        />
        <StatRow label='ATR' value={renderValue(atr)} />
        <StatRow label='Beta' value={renderValue(beta)} />

        <Col span={24}>
          <Divider css={dividerStyles} />
        </Col>

        <StatRow
          label='Forward Dividend & Yield'
          value={renderValue(dividendYieldIndicatedAnnual, { isPercent: true })}
        />
        <StatRow
          label='Performance YTD'
          value={renderValue(ytd, { suffix: '%' })}
        />
        <StatRow
          label='Performance Month'
          value={renderValue(lm, { suffix: '%' })}
        />
        <StatRow
          label='Performance Week'
          value={renderValue(lw, { suffix: '%' })}
        />
        <StatRow
          label='52 Week Range'
          value={
            week52Low && week52High
              ? `${roundToDecimals(week52Low)}$ - ${roundToDecimals(
                  week52High
                )}$`
              : '--'
          }
        />

        <Col span={24}>
          <Divider css={dividerStyles} />
        </Col>

        <StatRow label='Entry date' value={renderDate(entryDate)} />
        <StatRow
          label='Entry price'
          value={renderValue(entryPrice, { suffix: '$' })}
        />
        <StatRow label='Exit date' value={renderDate(exitDate)} />
        <StatRow
          label='Exit price'
          value={
            exitPrice && entryPrice
              ? renderValue(exitPrice, {
                  suffix: '$',
                  isPercent: false,
                  compareTo: entryPrice
                })
              : '--'
          }
        />
      </Row>
    </Card>
  );
};

const cardStyle = css`
  border: 1px solid var(--border-card-color);
  border-radius: 2px;
`;

const colLeftStyles = css`
  text-align: left;
  font-size: 1.4rem;
`;

const colRightStyles = css`
  text-align: right;
`;

const dividerStyles = css`
  margin: 0.2rem 0;
  padding: 0;
`;
