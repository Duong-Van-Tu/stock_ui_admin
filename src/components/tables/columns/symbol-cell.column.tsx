/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Icon } from '@/components/icons';
import { Button, Col, Divider, Popover, Row, Tooltip, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  ContentType,
  SymbolDetailsDrawer
} from '@/components/drawers/symbol-details';
import ChartMiniTradingview from '@/components/charts/trading-view-mini.chart';
import Link from 'next/link';
import { PageURLs } from '@/utils/navigate';
import { isDesktop, isMobile } from 'react-device-detect';
import EllipsisText from '@/components/ellipsis-text';
import { ScoreBlock } from '@/components/score-block';
import {
  capitalizeFirstLetter,
  formatPercent,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from '@/components/positive-negative-text';

type SymbolCellProps = {
  symbol: string;
  companyName?: string;
  isNews?: boolean;
  earningDate?: string;
  isNewsNegative?: boolean;
  showRecentNewsEarnings?: boolean;
  signalId?: number;
  stockInfo?: StockInfo;
  isOptions?: boolean;
  isSellSignal?: boolean;
  symbolColor?: string;
  isPutOptions?: boolean;
};

export const SymbolCell = ({
  symbol,
  companyName,
  isNews,
  earningDate,
  isNewsNegative,
  signalId,
  stockInfo,
  isOptions = false,
  isPutOptions = false,
  isSellSignal = false,
  symbolColor
}: SymbolCellProps) => {
  const t = useTranslations();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerContent, setDrawerContent] = useState<ContentType | null>(null);
  const [drawerOption, setDrawerOption] = useState<string>('');

  const handleIconClick = (contentType: ContentType, option?: string) => {
    setDrawerContent(contentType);
    setDrawerOption(option ?? '');
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerContent(null);
    setDrawerOption('');
  };

  return (
    <>
      <div css={symbolStyles}>
        <Popover
          content={
            <>
              <ChartMiniTradingview symbol={symbol} />
              {stockInfo && (
                <div css={stockInfoStyles}>
                  <div css={scoreWrapperStyles}>
                    <ScoreBlock
                      label={t('totalScore')}
                      value={stockInfo?.totalScore}
                      size='1.4rem'
                    />
                    <Divider type='vertical' css={dividerStyles} />
                    <ScoreBlock
                      label={t('fundamental')}
                      value={stockInfo?.fundamentalScore}
                      size='1.4rem'
                    />
                    <ScoreBlock
                      size='1.4rem'
                      label={t('sentiment')}
                      value={stockInfo?.sentimentScore}
                    />
                    <ScoreBlock
                      size='1.4rem'
                      label={t('earnings')}
                      value={stockInfo?.earningsScore}
                    />
                    <ScoreBlock
                      size='1.4rem'
                      label={t('performance')}
                      value={stockInfo?.performanceScore}
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
                        {isNumeric(stockInfo.beta)
                          ? roundToDecimals(stockInfo.beta)
                          : '--'}
                      </span>
                    </Col>
                    <Col css={columnStyles}>
                      <Typography.Text strong type='secondary'>
                        {t('atr')}:&nbsp;
                      </Typography.Text>
                      <div>
                        {isNumeric(stockInfo.atr)
                          ? roundToDecimals(stockInfo.atr)
                          : '--'}
                        {isNumeric(stockInfo.atrPercent) && (
                          <PositiveNegativeText
                            isNegative={stockInfo.atrPercent! < 0}
                            isPositive={stockInfo.atrPercent! > 0}
                          >
                            <span>
                              {' '}
                              ({formatPercent(stockInfo.atrPercent)})
                            </span>
                          </PositiveNegativeText>
                        )}
                      </div>
                    </Col>
                    <Col css={columnStyles}>
                      <Typography.Text strong type='secondary'>
                        {t('rsi')}:&nbsp;
                      </Typography.Text>
                      <span>
                        {stockInfo.rsi ? roundToDecimals(stockInfo.rsi) : '--'}
                      </span>
                    </Col>
                  </Row>
                </div>
              )}
            </>
          }
          trigger='hover'
          placement='rightTop'
          overlayStyle={{ padding: 0 }}
        >
          {isMobile ? (
            <span css={stockLinkStyles}>{symbol}</span>
          ) : (
            <Link
              css={[
                stockLinkStyles,
                symbolColor && symbolColorStyles(symbolColor)
              ]}
              href={PageURLs.ofStockDetail(symbol, signalId)}
              target={isDesktop ? '_blank' : undefined}
            >
              {symbol}
            </Link>
          )}
        </Popover>

        {isNews && (
          <Tooltip title={isMobile ? null : t('news')}>
            <Button
              css={buttonStyles}
              type='text'
              onClick={() => handleIconClick(ContentType.NEWS)}
            >
              <Icon
                icon='bell'
                width={18}
                height={18}
                fill={
                  isNewsNegative
                    ? 'var(--negative-color)'
                    : 'var(--positive-color)'
                }
              />
            </Button>
          </Tooltip>
        )}

        {earningDate && (
          <Tooltip title={isMobile ? null : t('earnings')}>
            <Button
              css={buttonStyles}
              type='text'
              onClick={() => handleIconClick(ContentType.EARNINGS)}
            >
              <Icon
                icon='calendar'
                width={18}
                height={18}
                fill='var(--earning-color)'
              />
            </Button>
          </Tooltip>
        )}

        {isOptions && (
          <Tooltip
            title={
              isMobile ? null : capitalizeFirstLetter(t('optionChainCall'))
            }
          >
            <Button
              css={buttonStyles}
              type='text'
              onClick={() => handleIconClick(ContentType.OPTIONS, 'Call')}
            >
              <Icon icon='optionsChanges' width={18} height={18} />
            </Button>
          </Tooltip>
        )}
        {isPutOptions && (
          <Tooltip
            title={isMobile ? null : capitalizeFirstLetter(t('optionChainPut'))}
          >
            <Button
              css={buttonStyles}
              type='text'
              onClick={() => handleIconClick(ContentType.OPTIONS, 'Put')}
            >
              <Icon
                fill='var(--negative-color)'
                icon='optionsChanges'
                width={18}
                height={18}
              />
            </Button>
          </Tooltip>
        )}
        {isSellSignal && (
          <Tooltip title={isMobile ? null : t('hitOnePercent')}>
            <Button
              css={sellIconStyles}
              shape='circle'
              type='text'
              icon={<Icon fill='red' icon='sell' width={16} height={16} />}
            />
          </Tooltip>
        )}
      </div>

      {companyName && (
        <div css={companyNameStyles}>
          <EllipsisText text={companyName} maxLines={1} />
        </div>
      )}

      <SymbolDetailsDrawer
        symbol={symbol}
        visible={drawerVisible}
        contentType={drawerContent}
        onClose={handleDrawerClose}
        option={drawerOption}
      />
    </>
  );
};

const symbolStyles = css`
  display: flex;
  align-items: center;
  font-weight: 600;
`;

const stockLinkStyles = css`
  margin-right: 0.6rem;
  color: var(--symbol-color);
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  &:hover {
    color: var(--primary-color);
  }
`;

const buttonStyles = css`
  width: 3rem;
  height: 3rem;
  padding: 0 !important;
  border-radius: 50%;
`;

const companyNameStyles = css`
  font-size: 1.4rem;
  line-height: 1.6rem;
`;

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
  margin-top: 1rem;
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

const sellIconStyles = css`
  position: absolute;
  left: -1.7rem;
  top: 0.2rem;
`;

const symbolColorStyles = (color: string) => css`
  color: ${color};
  &:hover {
    color: ${color};
    opacity: 0.9;
  }
`;
