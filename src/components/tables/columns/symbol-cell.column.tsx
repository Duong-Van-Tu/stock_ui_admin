/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Icon } from '@/components/icons';
import { Button, Tooltip } from 'antd';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SymbolDetailsDrawer } from '@/components/drawers/symbol-details.drawer';

enum ContentType {
  NEWS = 'news',
  EARNINGS = 'earnings',
  RECENT = 'recent'
}

type SymbolCellProps = {
  symbol: string;
  companyName?: string;
  isNews?: boolean;
  earningDate?: string;
  isNewsNegative?: boolean;
  showRecentNewsEarnings?: boolean;
};

export const SymbolCell = ({
  symbol,
  companyName,
  isNews,
  earningDate,
  isNewsNegative,
  showRecentNewsEarnings
}: SymbolCellProps) => {
  const t = useTranslations();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerContent, setDrawerContent] = useState<ContentType | null>(null);

  const handleIconClick = (contentType: ContentType) => {
    setDrawerContent(contentType);
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerContent(null);
  };

  return (
    <div css={symbolCellStyles}>
      <div css={symbolStyles}>
        <span>{symbol}</span>
        {isNews && (
          <Tooltip title={t('news')}>
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
          <Tooltip title={t('earnings')}>
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
        {showRecentNewsEarnings && (
          <Tooltip title={t('recentNewsAndEarnings')}>
            <Button
              css={buttonStyles}
              type='text'
              onClick={() => handleIconClick(ContentType.RECENT)}
            >
              <Icon icon='recent' width={18} height={18} />
            </Button>
          </Tooltip>
        )}
      </div>
      <div css={companyNameStyles}>{companyName}</div>

      <SymbolDetailsDrawer
        symbol={symbol}
        visible={drawerVisible}
        contentType={drawerContent}
        onClose={handleDrawerClose}
      />
    </div>
  );
};

const symbolCellStyles = css``;

const symbolStyles = css`
  span {
    margin-right: 0.6rem;
  }
  display: flex;
  align-items: center;
  font-weight: bold;
  color: var(--symbol-color);
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
