type Watchlist50DaysFilter = Filter & {
  period?: string;
  marketCap?: string;
  industry?: string;
  sector?: string;
};

type WatchlistIn50Days = {
  key: string;
  symbol: string;
  period: string;
  AIRating: number;
  AIRecommendation: string;
  AIExplain: string;
  previousClose: number;
  lowest50: number;
  changeLowest50: number;
  highest50: number;
  lowest20: number;
  changeLowest20: number;
  highest20: number;
  average: number;
  median: number;
  sma50: number;
  sma20: number;
  yahooPriceTargetMean: number;
  yahooPriceTargetHigh: number;
  yahooPriceTargetLow: number;
  buy: number;
  strongBuy: number;
  sell: number;
  strongSell: number;
  hold: number;
  marketCap: number;
  sector: string;
  industry: string;
  subindustry: string;
  createdAt: string;
};
