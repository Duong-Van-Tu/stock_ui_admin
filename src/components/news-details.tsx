/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import dayjs from 'dayjs';

import { CountSentiment } from '@/components/count-sentiment';
import { Radio } from 'antd';
import { NewsSentiment } from '@/components/news-sentiment';

type NewDetailsProps = { symbol: string };

export const NewDetails = ({ symbol }: NewDetailsProps) => {
  const [range, setRange] = useState<number>(7);

  const toDate = dayjs().format('YYYY-MM-DD');
  const fromDate = dayjs().subtract(range, 'day').format('YYYY-MM-DD');

  return (
    <div css={rootStyles}>
      <div css={selectDateStyles}>
        <Radio.Group
          value={range}
          onChange={(e) => setRange(e.target.value)}
          optionType='button'
          buttonStyle='solid'
        >
          <Radio.Button value={1}>1 Day</Radio.Button>
          <Radio.Button value={3}>3 Days</Radio.Button>
          <Radio.Button value={7}>7 Days</Radio.Button>
        </Radio.Group>
      </div>

      <CountSentiment fromDate={fromDate} toDate={toDate} symbol={symbol} />
      <NewsSentiment fromDate={fromDate} toDate={toDate} symbol={symbol} />
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const selectDateStyles = css`
  display: flex;
  justify-content: center;
  gap: 1.6rem;
  align-items: center;
`;
