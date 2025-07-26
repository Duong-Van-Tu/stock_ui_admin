type SortOrder = 'ascend' | 'descend' | undefined;

type Filter = {
  symbol?: string;
  sortField?: string;
  sortType?: string;
  page?: number;
  limit?: number;
};

type DayChartPoint = {
  time: number;
  value: number;
};

type IntradayStockChart = {
  symbol: string;
  dayLow: number;
  dayHigh: number;
  dayChart: DayChartPoint[];
};
