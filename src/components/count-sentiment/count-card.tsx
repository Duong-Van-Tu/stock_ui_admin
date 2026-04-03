/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Col, Typography } from 'antd';
import { PositiveNegativeText } from '../positive-negative-text';
import { isMobile } from 'react-device-detect';

const { Title } = Typography;

type RowItem = {
  label: string;
  value: number | undefined;
};

type CountCardProps = {
  title: string;
  subTitle?: string;
  value?: number;
  rows?: RowItem[];
  isPositive?: boolean;
  isNegative?: boolean;
};

export const CountCard = ({
  title,
  subTitle,
  value,
  rows,
  isPositive,
  isNegative
}: CountCardProps) => {
  const total = rows?.reduce((sum, row) => sum + (row.value ?? 0), 0) ?? 0;

  return (
    <Col span={12}>
      <Card css={cardStyles}>
        <Title css={titleStyles} level={5}>
          {title}
        </Title>

        {subTitle && <div css={subTitleStyles}>{subTitle}</div>}

        {rows && (
          <div css={rowsWrapperStyles}>
            {rows.map((row) => (
              <div key={row.label} css={rowStyles}>
                <span>{row.label}</span>
                <PositiveNegativeText
                  isPositive={isPositive}
                  isNegative={isNegative}
                >
                  <strong>{row.value ?? 0}</strong>
                </PositiveNegativeText>
              </div>
            ))}

            {/* TOTAL */}
            <div css={[rowStyles, totalRowStyles]}>
              <span>Total</span>
              <PositiveNegativeText
                isPositive={isPositive}
                isNegative={isNegative}
              >
                <strong>{total}</strong>
              </PositiveNegativeText>
            </div>
          </div>
        )}

        {/* Single value */}
        {!rows && (
          <PositiveNegativeText isPositive={isPositive} isNegative={isNegative}>
            <span css={valueStyles}>{value ?? 0}</span>
          </PositiveNegativeText>
        )}
      </Card>
    </Col>
  );
};

const cardStyles = css`
  .ant-card-body {
    padding: 1.2rem;
    text-align: center;
  }
`;

const valueStyles = css`
  display: block;
  font-size: 4rem;
  line-height: 7rem;
  font-weight: 600;
`;

const titleStyles = css`
  font-size: ${isMobile && '1.4rem !important'};
`;

const subTitleStyles = css`
  font-size: 1.2rem;
  color: #8c8c8c;
  margin-bottom: 0.6rem;
`;

const rowsWrapperStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.6rem;
`;

const rowStyles = css`
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
`;

const totalRowStyles = css`
  margin-top: 0.4rem;
  padding-top: 0.4rem;
  border-top: 1px solid var(--border-table-color);
  font-weight: 600;

  :root[data-theme='dark'] & {
    border-top-color: rgba(255, 255, 255, 0.18);
  }
`;
