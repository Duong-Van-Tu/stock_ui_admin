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
};
