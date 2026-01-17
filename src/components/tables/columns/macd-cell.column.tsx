/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { isNumeric, roundToDecimals } from '@/utils/common';

type MacdCellProps = {
  '5M'?: string;
  '15M'?: string;
  '1H'?: string;
  '1D'?: string;
  '1W'?: string;
};

const macdCellStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const macdItemStyles = css`
  display: flex;
  align-items: center;
  gap: 6px;
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

const renderMacdItem = (label: string, value?: string) => {
  if (value === 'U') {
    return (
      <div css={macdItemStyles}>
        <span>{label}</span>
        <ArrowUpOutlined css={upIconStyles} />
      </div>
    );
  }

  if (value === 'D') {
    return (
      <div css={macdItemStyles}>
        <span>{label}</span>
        <ArrowDownOutlined css={downIconStyles} />
      </div>
    );
  }

  const hasValue = isNumeric(value);
  if (!hasValue) {
    return (
      <div css={macdItemStyles}>
        <span>{label}</span>
        <span css={emptyStyles}>-</span>
      </div>
    );
  }

  const val = Number(value);
  const rounded = roundToDecimals(val);

  return (
    <div css={macdItemStyles}>
      <span>{label}</span>
      {val > 0 ? (
        <ArrowUpOutlined css={upIconStyles} />
      ) : val < 0 ? (
        <ArrowDownOutlined css={downIconStyles} />
      ) : (
        <span css={emptyStyles}>-</span>
      )}
      <span
        css={val > 0 ? upIconStyles : val < 0 ? downIconStyles : emptyStyles}
      >
        {rounded}
      </span>
    </div>
  );
};

export const MacdCell = ({
  '5M': m5,
  '15M': m15,
  '1H': h1,
  '1D': d1,
  '1W': w1
}: MacdCellProps) => {
  return (
    <div css={macdCellStyles}>
      {renderMacdItem('5M', m5)}
      {renderMacdItem('15M', m15)}
      {renderMacdItem('1H', h1)}
      {renderMacdItem('1D', d1)}
      {renderMacdItem('1W', w1)}
    </div>
  );
};
