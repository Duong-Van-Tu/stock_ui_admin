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
    {
      label: t('watching'),
      color: 'var(--watching-color)',
      accentColor: 'var(--watching-accent-color)'
    },
    {
      label: t('addedToPortfolio'),
      color: 'var(--added-portfolio-color)',
      accentColor: 'var(--added-portfolio-accent-color)'
    }
  ];

  return (
    <div css={[legendContainerStyles, customStyles]}>
      {statuses.map((status, index) => (
        <div
          key={index}
          css={legendItemStyle(status.color, status.accentColor)}
        >
          <div css={colorBoxStyle(status.accentColor)} />
          <Typography.Text css={labelStyle}>{status.label}</Typography.Text>
        </div>
      ))}
    </div>
  );
};

const legendContainerStyles = css`
  display: flex;
  gap: 1.6rem;
  flex-wrap: wrap;
`;

const legendItemStyle = (backgroundColor: string, accentColor: string) => css`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background: ${backgroundColor};
  border: 1px solid ${accentColor};
`;

const colorBoxStyle = (color: string) => css`
  width: 10px;
  height: 10px;
  background-color: ${color};
  border-radius: 999px;
  box-shadow: 0 0 0 3px ${color}33;
`;

const labelStyle = css`
  font-size: 14px;
  color: var(--text-color);
`;
