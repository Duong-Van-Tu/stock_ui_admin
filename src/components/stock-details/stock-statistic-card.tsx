/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Row, Col, Typography, Divider, Button } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import { watchStockDetails } from '@/redux/slices/stock-details.slice';
import {
  formatMarketCap,
  formatNumberShort,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from '../positive-negative-text';
import { useTranslations } from 'next-intl';
import AIRatingChart from '../charts/AI-rating.chart';
import { useModal } from '@/hooks/modal.hook';
import { AIExplain } from '../ai-explain';
import { Icon } from '../icons';

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
  const modal = useModal();
  const stockDetails = useAppSelector(watchStockDetails);
  const {
    ticker,
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
    aiRating,
    aiExplain
  } = stockDetails || {};

  return (
    <Card title={t('statistic')} bordered size='small' css={cardStyles}>
      <Row gutter={[8, 8]}>
        {aiRating && aiExplain && (
          <div css={chartContainer}>
            <Col span={24}>
              <Typography.Title css={aiRatingStyles}>
                {t('aiRating')}{' '}
                <Icon
                  icon='aiStar'
                  fill={'var(--orange-color)'}
                  width={26}
                  height={26}
                />
              </Typography.Title>
            </Col>
            <AIRatingChart rating={aiRating} />
            <Col span={24}>
              <Button
                css={aiExplainBtnStyles}
                onClick={() =>
                  modal.openModal(
                    <AIExplain symbol={ticker!} text={aiExplain} />
                  )
                }
                type='link'
                block
              >
                {t('aiExplain')}
              </Button>
            </Col>
            <Col span={24}>
              <Divider css={dividerStyles} />
            </Col>
          </div>
        )}
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
      </Row>
    </Card>
  );
};

const cardStyles = css`
  border: 1px solid var(--border-card-color);
  border-radius: 2px;
  height: 100%;
  .ant-card-head-title {
    font-size: 1.8rem;
  }
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

const chartContainer = css`
  position: relative;
  width: 100%;
`;

const aiExplainBtnStyles = css`
  padding: 0;
  height: unset;
  position: absolute;
  bottom: 4rem;
`;

const aiRatingStyles = css`
  margin-bottom: 0 !important;
  text-align: center;
  position: relative;
  margin-top: 1rem;
  color: var(--orange-color) !important;
  font-size: 1.8rem !important;
  svg {
    top: -0.5rem;
    position: absolute;
  }
`;
