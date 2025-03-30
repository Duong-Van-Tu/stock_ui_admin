import { PositiveNegativeText } from '@/components/positive-negative-text';
import { roundToDecimals, formatPercent } from '@/utils/common';

type StockChangeCellProps = {
  value: number;
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
      <div>{roundToDecimals(value, 2)}</div>
      <div>({formatPercent(percentage, 2)})</div>
    </PositiveNegativeText>
  );
};
