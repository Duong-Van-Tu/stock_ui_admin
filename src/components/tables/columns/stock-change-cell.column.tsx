import { PositiveNegativeText } from '@/components/positive-negative-text';
import { roundToDecimals, formatPercent } from '@/utils/common';

type StockChangeCellProps = {
  value: number | string;
  percentage: number;
};

export const StockChangeCell = ({
  value,
  percentage
}: StockChangeCellProps) => {
  return (
    <PositiveNegativeText
      isPositive={percentage >= 0}
      isNegative={percentage < 0}
    >
      <div>{typeof value === 'string' ? value : roundToDecimals(value, 2)}</div>
      <div>({formatPercent(percentage, 2)})</div>
    </PositiveNegativeText>
  );
};
