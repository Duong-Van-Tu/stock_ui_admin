/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Empty } from 'antd';

export const EmptyDataTable = () => {
  return (
    <div css={rootStyles}>
      <Empty />
    </div>
  );
};

const rootStyles = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.6rem;
`;
