import { useMemo } from 'react';
import dayjs from 'dayjs';

export function usePastDateRange(days: number) {
  const { fromDate, toDate } = useMemo(() => {
    const toDate = dayjs().format('YYYY-MM-DD');
    const fromDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    return { fromDate, toDate };
  }, [days]);

  return { fromDate, toDate };
}
