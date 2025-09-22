/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, memo } from 'react';
import { ScoreBlock } from '../score-block';
import { Col, Divider, Row, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { formatPercent, isNumeric, roundToDecimals } from '@/utils/common';
import { PositiveNegativeText } from '../positive-negative-text';

type SingleTickerTradingviewProps = {
  symbol: string;
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  locale?: string;
  signal?: Signal;
};

const SingleTickerTradingview = ({
  signal,
  symbol,
  width = 340,
  height = 170,
  colorTheme = 'light',
  locale = 'en'
}: SingleTickerTradingviewProps) => {
  const container = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbol": "${symbol}",
        "width": "${width}",
        "height": "${height}",
        "locale": "${locale}",
        "dateRange": "3M",
        "colorTheme": "${colorTheme}",
        "isTransparent": true,
        "autosize": false
      }`;
    container.current.appendChild(script);
  }, [symbol, width, height, colorTheme, locale]);

  return (
    <div
      css={css`
        position: relative;
        overflow: hidden;
        &::before {
          content: '';
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 40px;
          height: 40px;
          background: var(--white-color);
          border-radius: 50%;
        }
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 10;
          pointer-events: all;
        }
      `}
      style={{ width, height }}
    >
      <div
        className='tradingview-widget-container'
        ref={container}
        style={{
          width: '100%',
          height: innerHeight as any
        }}
      />
      {signal && (
        <div css={stockInfoStyles}>
          <div css={scoreWrapperStyles}>
            <ScoreBlock
              label={t('totalScore')}
              value={signal?.totalScore}
              size='1.4rem'
            />
            <Divider type='vertical' css={dividerStyles} />
            <ScoreBlock
              label={t('fundamental')}
              value={signal?.fundamentalScore}
              size='1.4rem'
            />
            <ScoreBlock
              size='1.4rem'
              label={t('sentiment')}
              value={signal?.sentimentScore}
            />
            <ScoreBlock
              size='1.4rem'
              label={t('earnings')}
              value={signal?.earningsScore}
            />
            <ScoreBlock
              size='1.4rem'
              label={t('performance')}
              value={signal?.performanceScore}
            />
          </div>
          <Row
            css={css`
              padding: 0 0.2rem;
            `}
            gutter={[10, 10]}
            justify='space-between'
            align='middle'
          >
            <Col css={columnStyles}>
              <Typography.Text strong type='secondary'>
                {t('beta')}:&nbsp;
              </Typography.Text>
              <span>
                {isNumeric(signal.beta) ? roundToDecimals(signal.beta) : '--'}
              </span>
            </Col>
            <Col css={columnStyles}>
              <Typography.Text strong type='secondary'>
                {t('atr')}:&nbsp;
              </Typography.Text>
              <div>
                {isNumeric(signal.atr) ? roundToDecimals(signal.atr) : '--'}
                {isNumeric(signal.atrPercent) && (
                  <PositiveNegativeText
                    isNegative={signal.atrPercent < 0}
                    isPositive={signal.atrPercent > 0}
                  >
                    <span> ({formatPercent(signal.atrPercent)})</span>
                  </PositiveNegativeText>
                )}
              </div>
            </Col>
            <Col css={columnStyles}>
              <Typography.Text strong type='secondary'>
                {t('rsi')}:&nbsp;
              </Typography.Text>
              <span>{signal.rsi ?? '--'}</span>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default memo(SingleTickerTradingview);

const scoreWrapperStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const dividerStyles = css`
  margin: 0;
  height: 4rem;
`;

const stockInfoStyles = css`
  position: absolute;
  bottom: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const columnStyles = css`
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
`;
