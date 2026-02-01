type EarningFilter = Filter & {
  date: string;
};

type EarningsSummary = {
  date: Date;
  total: number | null;
};

type Earning = {
  id: number;
  key: string;
  date: string;
  symbol: string;
  companyName: string;
  earningsScore: number;
  epsActual: number;
  epsEstimate: number;
  epsSurprise: number;
  epsSurprisePercent: number;
  isAddWatchList: boolean;
  marketCap?: number;
  revenueActual: number;
  revenueEstimate: number;
  revenueSurprise: number;
  revenueSurprisePercent: number;
  stockInfo: StockInfo;
  avgSentiment: number;
  isNews: boolean;
  isNewsNegative: boolean;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  intradayStockChart: IntradayStockChart;
};

type EconomicCalendar = {
  id: string;
  start: string;
  name: string;
  impact: string;
  description: string;
  source: string;
  volatility: string;
  periodType: string;
};
