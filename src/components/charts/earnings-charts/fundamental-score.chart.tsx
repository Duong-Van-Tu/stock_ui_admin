/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Card } from 'antd';
import { useTranslations } from 'next-intl';
import GaugeChart from '../gauge.chart';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getFundamentalScore,
  watchFundamentalScore
} from '@/redux/slices/stock-details.slice';
import { useCallback, useEffect } from 'react';
import { roundToDecimals } from '@/utils/common';

type FundamentalScoreProps = {
  symbol: string;
};

export default function FundamentalScoreChart({
  symbol
}: FundamentalScoreProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const fundamentalScore = useAppSelector(watchFundamentalScore);

  const fetchFundamentalScore = useCallback(() => {
    dispatch(getFundamentalScore(symbol));
  }, [dispatch, symbol]);

  useEffect(() => {
    fetchFundamentalScore();
  }, [fetchFundamentalScore]);

  return (
    <Card title={<span css={titleStyles}>{t('fundamentalScore')}</span>}>
      <div css={chartsContainerStyle}>
        {[
          fundamentalScore.detailFundamentalScore,
          fundamentalScore.ebitScore,
          fundamentalScore.grossIncomeScore,
          fundamentalScore.netIncomeScore,
          fundamentalScore.revenueScore
        ].map((score, index) => (
          <GaugeChart
            key={index}
            value={roundToDecimals(score)!}
            label={
              index === 0
                ? t('fundamentalScore')
                : index === 1
                ? t('ebitScore')
                : index === 2
                ? t('netIncomeScore')
                : index === 3
                ? t('grossIncomeScore')
                : t('grossIncomeScore')
            }
          />
        ))}
      </div>
    </Card>
  );
}

const chartsContainerStyle = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const titleStyles = css`
  font-size: 2rem;
`;
