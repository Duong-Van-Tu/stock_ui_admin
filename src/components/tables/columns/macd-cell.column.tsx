/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Space, Typography } from 'antd';
import { isNumeric, roundToDecimals } from '@/utils/common';

const { Text } = Typography;

type MacdCellProps = {
  '5M'?: number;
  '15M'?: number;
  '1H'?: number;
  '1D'?: number;
};

const macdItemStyles = (value: number) => css`
  color: ${value > 0
    ? 'var(--stock-positive-color)'
    : 'var(--stock-negative-color)'};
`;

export const MacdCell = ({
  '5M': m5,
  '15M': m15,
  '1H': h1,
  '1D': d1
}: MacdCellProps) => {
  return (
    <Space direction='vertical' size={0}>
      <Space size='middle'>
        <Text>
          5M:{' '}
          <span css={macdItemStyles(m5 || 0)}>
            {isNumeric(m5) ? roundToDecimals(m5) : '-'}
          </span>
        </Text>
        <Text>
          15M:{' '}
          <span css={macdItemStyles(m15 || 0)}>
            {isNumeric(m15) ? roundToDecimals(m15) : '-'}
          </span>
        </Text>
      </Space>
      <Space size='middle'>
        <Text>
          1H:{' '}
          <span css={macdItemStyles(h1 || 0)}>
            {isNumeric(h1) ? roundToDecimals(h1) : '-'}
          </span>
        </Text>
        <Text>
          1D:{' '}
          <span css={macdItemStyles(d1 || 0)}>
            {isNumeric(d1) ? roundToDecimals(d1) : '-'}
          </span>
        </Text>
      </Space>
    </Space>
  );
};
