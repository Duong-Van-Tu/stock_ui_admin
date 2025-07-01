import { PositiveNegativeText } from './positive-negative-text';
import { roundToDecimals, formatPercent } from '@/utils/common';

type PriceWithChangeProps = {
  price?: number;
  comparePrice?: number;
  prefix?: string;
  fallback?: string;
};

export const PriceWithChange = ({
  price,
  comparePrice,
  prefix = '$',
  fallback = '--'
}: PriceWithChangeProps) => {
  if (typeof price !== 'number' || typeof comparePrice !== 'number') {
    return <>{fallback}</>;
  }

  const percentChange = ((price - comparePrice) / comparePrice) * 100;

  return (
    <PositiveNegativeText
      isPositive={percentChange >= 0}
      isNegative={percentChange < 0}
    >
      <span>
        {prefix}
        {roundToDecimals(price, 2)}&nbsp;({formatPercent(percentChange)})
      </span>
    </PositiveNegativeText>
  );
};
