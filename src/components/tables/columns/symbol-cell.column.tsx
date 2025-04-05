/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Icon } from '@/components/icons';
import { Button, Tooltip } from 'antd';
import { useTranslations } from 'next-intl';

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
  return (
    <div css={symbolCellStyles}>
      <div css={symbolStyles}>
        <span>{symbol}</span>
        {isNews && (
          <Tooltip title={t('news')}>
            <Button css={buttonStyles} type='text'>
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
            <Button css={buttonStyles} type='text'>
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
          <Tooltip title='Recent News & Earnings (14 days)'>
            <Button css={buttonStyles} type='text'>
              <Icon icon='recent' width={18} height={18} />
            </Button>
          </Tooltip>
        )}
      </div>
      <div css={companyNameStyles}>{companyName}</div>
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
