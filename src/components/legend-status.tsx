/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';

type LegendStatusProps = {
  customStyles?: SerializedStyles;
};

export const LegendStatus = ({ customStyles }: LegendStatusProps) => {
  const t = useTranslations();
  const statuses = [
    { label: t('watching'), color: 'var(--watching-color)' },
    { label: t('addedToPortfolio'), color: 'var(--added-portfolio-color)' }
  ];

  return (
    <div css={[legendContainerStyles, customStyles]}>
      {statuses.map((status, index) => (
        <div key={index} css={legendItemStyle}>
          <div css={colorBoxStyle(status.color)} />
          <Typography.Text css={labelStyle}>{status.label}</Typography.Text>
        </div>
      ))}
    </div>
  );
};

const legendContainerStyles = css`
  display: flex;
`;

const legendItemStyle = css`
  display: flex;
  align-items: center;
  margin-right: 16px;
`;

const colorBoxStyle = (color: string) => css`
  width: 12px;
  height: 12px;
  background-color: ${color};
  margin-right: 4px;
`;

const labelStyle = css`
  font-size: 14px;
`;
