/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { isNumeric, roundToDecimals } from '@/utils/common';
import { PositiveNegativeText } from './positive-negative-text';

const { Text } = Typography;

type StatItemProps = {
  label: string;
  value?: number;
  size?: string;
};

export const ScoreBlock = ({
  label,
  value = 0,
  size = '1.6rem'
}: StatItemProps) => (
  <div css={statBlockStyles}>
    <Text strong type='secondary'>
      {label}
    </Text>
    <br />
    {isNumeric(value) ? (
      <PositiveNegativeText
        isPositive={value > 7}
        isNegative={value < 4}
        size={size}
      >
        <span>{roundToDecimals(value, 2)}</span>
      </PositiveNegativeText>
    ) : (
      '--'
    )}
  </div>
);

const statBlockStyles = css`
  text-align: center;
`;
