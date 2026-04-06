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
import { useRouter } from 'next/navigation';
import { useThemeMode } from '@/providers/theme.provider';

type SymbolCellProps = {
  symbol: string;
  companyName?: string;
  symbolColor?: string;
  companyNameColor?: string;
  isNews?: boolean;
  earningDate?: string;
  isNewsNegative?: boolean;
  showRecentNewsEarnings?: boolean;
  stockInfo?: StockInfo;
  isOptions?: boolean;
  isSellSignal?: boolean;
  isPutOptions?: boolean;
  lsegNews?: number;
  link?: string;
};

export const SymbolCell = ({
  symbol,
  companyName,
  symbolColor,
  companyNameColor,
  isNews,
  earningDate,
  isNewsNegative,
  stockInfo,
  isOptions = false,
  isPutOptions = false,
  isSellSignal = false,
  lsegNews,
  link
}: SymbolCellProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerContent, setDrawerContent] = useState<ContentType | null>(null);
  const [drawerOption, setDrawerOption] = useState<string>('');
  const popoverBackgroundColor = isDarkMode
    ? '#1f1f1f'
    : 'var(--surface-elevated-color)';
  const popoverBorderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.1)'
    : 'var(--border-light-color)';

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
          color={popoverBackgroundColor}
          content={
            <div css={popoverContentStyles(popoverBackgroundColor)}>
              <ChartMiniTradingview symbol={symbol} />
              {stockInfo && (
                <div css={stockInfoStyles(popoverBackgroundColor, isDarkMode)}>
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
                      <Typography.Text css={metricLabelStyles}>
                        {t('beta')}:&nbsp;
                      </Typography.Text>
                      <span>
                        {isNumeric(stockInfo.beta)
                          ? roundToDecimals(stockInfo.beta)
                          : '--'}
                      </span>
                    </Col>
                    <Col css={columnStyles}>
                      <Typography.Text css={metricLabelStyles}>
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
                      <Typography.Text css={metricLabelStyles}>
                        {t('rsi')}:&nbsp;
                      </Typography.Text>
                      <span>
                        {stockInfo.rsi ? roundToDecimals(stockInfo.rsi) : '--'}
                      </span>
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          }
          trigger='hover'
          placement='rightTop'
          overlayStyle={{
            padding: 0,
            ['--antd-arrow-background-color' as any]: popoverBackgroundColor
          }}
          overlayInnerStyle={{
            background: popoverBackgroundColor,
            border: `1px solid ${popoverBorderColor}`,
            borderRadius: '0.8rem',
            padding: 0
          }}
        >
          {isMobile ? (
            <span css={stockLinkStyles(symbolColor)}>{symbol}</span>
          ) : (
            <Link
              css={stockLinkStyles(symbolColor)}
              href={link ?? PageURLs.ofStockDetail(symbol)}
              target={link ? undefined : isDesktop ? '_blank' : undefined}
            >
              <span>{symbol}</span>
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
        {!!lsegNews && (
          <Tooltip title={isMobile ? null : t('news')}>
            <Button
              css={buttonStyles}
              type='text'
              onClick={() =>
                router.push(`${PageURLs.ofFinnhubLsegNews()}?symbol=${symbol}`)
              }
            >
              <Icon
                icon='finnhubLseg'
                fill={
                  lsegNews === 1
                    ? 'var(--positive-color)'
                    : 'var(--negative-color)'
                }
                width={18}
                height={18}
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
        <div css={companyNameStyles(companyNameColor)}>
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

const stockLinkStyles = (symbolColor?: string) => css`
  margin-right: 0.6rem;
  color: ${symbolColor || 'var(--symbol-color)'};
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

const companyNameStyles = (companyNameColor?: string) => css`
  font-size: 1.3rem;
  line-height: 1.4rem;
  font-weight: 500;
  color: ${companyNameColor || 'var(--text-color)'};
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

const stockInfoStyles = (backgroundColor: string, isDarkMode: boolean) => css`
  margin-top: 1rem;
  padding-top: 1.2rem;
  bottom: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: ${backgroundColor};
  border-top: 1px solid
    ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--border-light-color)'};
`;

const popoverContentStyles = (backgroundColor: string) => css`
  background: ${backgroundColor};
  padding: 1.2rem;
  border-radius: 0.8rem;
`;

const columnStyles = css`
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
`;

const metricLabelStyles = css`
  color: var(--text-secondary-color) !important;
`;

const sellIconStyles = css`
  position: absolute;
  left: -1.7rem;
  top: 0.2rem;
`;
