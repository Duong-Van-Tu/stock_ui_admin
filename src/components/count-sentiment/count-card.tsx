/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Col, Typography } from 'antd';
import { PositiveNegativeText } from '../positive-negative-text';

const { Title } = Typography;
type CountCardProps = {
  title: string;
  value: number | undefined;
  isPositive?: boolean;
  isNegative?: boolean;
};

export const CountCard = ({
  title,
  value,
  isPositive,
  isNegative
}: CountCardProps) => (
  <Col span={12}>
    <Card css={cardStyles}>
      <Title level={5}>{title}</Title>
      <PositiveNegativeText isPositive={isPositive} isNegative={isNegative}>
        <div css={valueStyles}>{value}</div>
      </PositiveNegativeText>
    </Card>
  </Col>
);

const cardStyles = css`
  display: flex;
  justify-content: center;
  .ant-card-body {
    padding: 2rem 1rem;
  }
`;

const valueStyles = css`
  font-size: 3.4rem;
  text-align: center;
  font-weight: 600;
`;
