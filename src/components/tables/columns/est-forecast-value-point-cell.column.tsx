import { roundToDecimals, isNumeric, formatNumberShort } from '@/utils/common';

type EstForecastValuePointCellProps = {
  value: number | string | null;
  point: number | string | null;
};

export const EstForecastValuePointCell = ({
  value,
  point
}: EstForecastValuePointCellProps) => {
  const renderValue = () => {
    if (value == null) return '-';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed.toLowerCase() === 'null') return '-';

      if (trimmed.endsWith('%')) {
        const numPart = trimmed.slice(0, -1).trim();
        if (numPart === '' || numPart.toLowerCase() === 'null') return '-';
        if (isNumeric(numPart)) {
          const num = Number(numPart);
          return <span>{`${roundToDecimals(num, 2)}%`}</span>;
        }
        return <span>{trimmed}</span>;
      }

      if (isNumeric(trimmed)) {
        const num = Number(trimmed);
        const display =
          Math.abs(num) >= 1000
            ? formatNumberShort(num)
            : roundToDecimals(num, 2);
        return <span>{display}</span>;
      }

      return <span>{trimmed}</span>;
    }

    if (!isNumeric(value)) return '-';
    const num = Number(value as number);
    const display =
      Math.abs(num) >= 1000 ? formatNumberShort(num) : roundToDecimals(num, 2);
    return <span>{display}</span>;
  };

  const renderPoint = () => {
    if (point == null) return '-';
    if (typeof point === 'string') {
      const trimmed = point.trim();
      if (trimmed === '' || trimmed.toLowerCase() === 'null') return '-';
      if (trimmed.endsWith('%')) return trimmed;
      if (isNumeric(trimmed)) return `${roundToDecimals(Number(trimmed), 2)}`;
      return trimmed;
    }
    if (!isNumeric(point)) return '-';
    return `${roundToDecimals(point as number, 2)}`;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div>{renderValue()}</div>
      <div>
        {(() => {
          const p = renderPoint();
          return p === '-' ? p : `(${p})`;
        })()}
      </div>
    </div>
  );
};
