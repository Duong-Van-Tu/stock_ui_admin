/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card, Col, Typography } from 'antd';
import { PositiveNegativeText } from '../positive-negative-text';
import { isMobile } from 'react-device-detect';

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
      <Title css={titleStyles} level={5}>
        {title}
      </Title>
      <PositiveNegativeText isPositive={isPositive} isNegative={isNegative}>
        <span css={valueStyles}>{value}</span>
      </PositiveNegativeText>
    </Card>
  </Col>
);

const cardStyles = css`
  display: flex;
  justify-content: center;
  .ant-card-body {
    padding: 1rem;
  }
`;

const valueStyles = css`
  display: block;
  font-size: 4.4rem;
  line-height: 8rem;
  text-align: center;
  font-weight: 600;
`;

const titleStyles = css`
  ${isMobile && '1.4rem'}
`;
