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

type StockInfo = {
  totalScore?: number;
  fundamentalScore?: number;
  sentimentScore?: number;
  earningsScore?: number;
  beta?: number;
  atr?: number;
  atrPercent?: number;
  rsi?: number;
  performanceScore?: number;
};
