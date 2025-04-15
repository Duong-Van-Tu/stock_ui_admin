type StockDetails = {
  atr: number;
  beta: number;
  companyName: string;
  currency: string;
  dividendYieldIndicatedAnnual: number;
  earningsScore: number;
  entryDate: string;
  entryPrice?: number;
  exitDate: string;
  exitPrice?: number;
  fundamentalScore: number;
  industry: string;
  isAddWatchList: boolean;
  last2Days: number;
  lm: number;
  lw: number;
  marketCap?: number;
  marketCapTitle: string;
  sector: string;
  sentimentScore: number;
  subIndustry: string;
  ticker: string;
  totalScore: number;
  volume: number;
  ytd: number;
  week52High: number;
  week52HighDate: string;
  week52Low: number;
  week52LowDate: string;
};

type FundamentalDetails = {
  year: string;
  ebit: number;
  grossIncome: number;
  netIncome: number;
  revenue: number;
};

type FundamentalScore = {
  detailFundamentalScore: number;
  ebitScore: number;
  grossIncomeScore: number;
  netIncomeScore: number;
  revenueScore: number;
};

type FundamentalDetailScore = {
  year: number;
  ebitMomentumScore: number;
  ebitRecentScore: number;
  grossIncomeMomentumScore: number;
  grossIncomeRecentScore: number;
  netIncomeMomentumScore: number;
  netIncomeRecentScore: number;
  revenueMomentumScore: number;
  revenueRecentScore: number;
  netMarginMomentumScore: number;
  netMarginRecentScore: number;
};

type SentimentScore = {
  score3m: number;
  score1m: number;
  score1w: number;
};

type MovingSentimentScore = {
  timestamp: string;
  score1w: number;
  score1m: number;
  score3m: number;
};

type StockDetailFilter = Filter & {
  symbol: string;
  fromDate?: string;
  toDate?: string;
};

type EarningsScore = {
  earningsScore: number;
  epsActualScore: number;
  epsEstimateScore: number;
};

type EarningsDetailScore = {
  date: string;
  epsActualMomentumScore: number;
  epsActualRecentScore: number;
  epsEstimateMomentumScore: number;
  epsEstimateMomentumScore: number;
  surpriseRecentScore: number;
};
