/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';

type AIExplainProps = {
  symbol: string;
  text: string;
  title?: string;
};
export const AIExplain = ({ symbol, text, title }: AIExplainProps) => {
  const t = useTranslations();
  return (
    <div css={rootStyles}>
      <h3>
        {title ? title : t('aiExplain')} (<span>{symbol}</span>)
      </h3>
      <p>{text}</p>
    </div>
  );
};

const rootStyles = css`
  h3 {
    text-align: center;
    font-weight: 600;
    font-size: 2.2rem;
  }
  p {
    margin-bottom: 0;
  }
`;
