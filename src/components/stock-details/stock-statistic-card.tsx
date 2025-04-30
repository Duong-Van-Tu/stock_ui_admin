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
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';

const { Text } = Typography;

const renderValue = (
  value?: number,
  {
    suffix = '',
    isPercent = false,
    compareTo
  }: { suffix?: string; isPercent?: boolean; compareTo?: number } = {}
) => {
  if (!value) return '--';

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
  value ? dayjs(value).tz(TimeZone.NEW_YORK).format('MM/DD/YYYY HH:mm') : '--';

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
  const t = useTranslations();
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
    <Card title={t('statistic')} bordered size='small' css={cardStyle}>
      <Row gutter={[8, 8]}>
        <StatRow
          label={t('marketCapIntraday')}
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
          label={t('volume')}
          value={volume ? formatNumberShort(volume) : '--'}
        />
        <StatRow label={t('atr')} value={renderValue(atr)} />
        <StatRow label={t('beta')} value={renderValue(beta)} />

        <Col span={24}>
          <Divider css={dividerStyles} />
        </Col>

        <StatRow
          label={t('forwardDividendYield')}
          value={renderValue(dividendYieldIndicatedAnnual, { isPercent: true })}
        />
        <StatRow
          label={t('performanceYTD')}
          value={renderValue(ytd, { isPercent: true })}
        />
        <StatRow
          label={t('performanceMonth')}
          value={renderValue(lm, { isPercent: true })}
        />
        <StatRow
          label={t('performanceWeek')}
          value={renderValue(lw, { isPercent: true })}
        />
        <StatRow
          label={t('week52Range')}
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

        <StatRow label={t('entryDate')} value={renderDate(entryDate)} />
        <StatRow
          label={t('entryPrice')}
          value={entryPrice ? `${roundToDecimals(entryPrice)}$` : '--'}
        />
        <StatRow label={t('exitDate')} value={renderDate(exitDate)} />
        <StatRow
          label={t('exitPrice')}
          value={
            exitPrice && entryPrice ? (
              <PositiveNegativeText
                isPositive={exitPrice >= entryPrice}
                isNegative={exitPrice < entryPrice}
              >
                <span>
                  {`${roundToDecimals(exitPrice)}$ `}(
                  {formatPercent(((exitPrice - entryPrice) / entryPrice) * 100)}
                  )
                </span>
              </PositiveNegativeText>
            ) : (
              '--'
            )
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
  font-weight: 500;
`;

const dividerStyles = css`
  margin: 0.2rem 0;
  padding: 0;
`;
