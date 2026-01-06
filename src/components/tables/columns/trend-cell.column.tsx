/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

type TrendCellProps = {
  value: {
    '1H': string;
    '1D': string;
    '1W': string;
  };
};

export const TrendCell = ({ value }: TrendCellProps) => {
  const renderIcon = (trend: string) => {
    if (trend === 'U') {
      return <ArrowUpOutlined css={upIconStyles} />;
    }

    if (trend === 'D') {
      return <ArrowDownOutlined css={downIconStyles} />;
    }

    return <span css={emptyStyles}>-</span>;
  };

  return (
    <div css={trendCellStyles}>
      <div css={trendItemStyles}>
        <span>1H</span>
        {renderIcon(value['1H'])}
      </div>
      <div css={trendItemStyles}>
        <span>1D</span>
        {renderIcon(value['1D'])}
      </div>
      <div css={trendItemStyles}>
        <span>1W</span>
        {renderIcon(value['1W'])}
      </div>
    </div>
  );
};

const trendCellStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const trendItemStyles = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const upIconStyles = css`
  color: var(--positive-color);
`;

const downIconStyles = css`
  color: var(--negative-color);
`;

const emptyStyles = css`
  color: #9ca3af;
`;
