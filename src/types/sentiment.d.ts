type SentimentFilter = Filter & {
  lastHours?: number;
  group?: string;
  sentiment?: string;
  impact?: string;
  entryDate?: string;
  fromDate?: string;
  toDate?: string;
  urgency?: number[];
  sector?: string;
  industry?: string;
  startDate?: string;
  endDate?: string;
  sourceType?: 'finnhub' | 'lseg';
  breakingNews?: number;
};

type CountSentiment = {
  countNegative: number;
  countPositive: number;
  countVeryNegative: number;
  countVeryPositive: number;
};

type Sentiment = 'positive' | 'negative' | 'very_positive' | 'very_negative';

type SentimentParams = {
  symbol: string;
  query?: SentimentFilter;
};

type CompanyNews = {
  key: string;
  timestamp: string;
  headline: string;
  source: string;
  sentiment: Sentiment;
  impact: string;
  sentimentScore: number;
  sentimentScore1w: number;
  url: string;
};

type ListWatcher = {
  key: string;
  symbol: string;
  groupStock: string;
  publishingTime: string;
  headline: string;
  source: string;
  sentiment: string;
  impact: string;
  url: string;
  beta: number;
  avgVolume: number;
  atr: number;
  atrPercent: number;
  fundamentalScore: number;
  sentimentScore: number;
  earningsScore: number;
  weekLow52: number;
  weekHigh52: number;
  marketCapListWatcher: string;
  industry: string;
  sector: string;
  subIndustry: string;
  dateTime: number;
  earningDate: string | null;
  totalScore: number;
  stockInfo: StockInfo;
};

type NewsLatest = {
  key: string;
  timestamp: string;
  symbol: string;
  headline: string;
  source: string;
  sentiment: string;
  impact: string;
  sentimentScore1w: number;
  sentimentScore: number;
  sentimentScore1m: number;
  sentimentScore3m: number;
  url: string;
};

type NewsSentiment = {
  key: string;
  symbol: string;
  symbols: string[];
  title: string;
  sentiment: number;
  versionCreated: string;
  story?: string;
  source: string;
  urgency: number;
};

type FinnhubAndLsegNewsTableItem = {
  key: string;
  id: string;
  symbol: string;
  datetime: string;
  headline: string;
  summary: string;
  image?: string;
  url: string;
  source: string;
  sourceType: string;
  createDate: string;
  newsRelevance: number;
  newsScore?: number;
  articleScore?: number;
  weightedScore?: number;
  timeWeight: number;
  direction: string;
  horizon: string;
  newsType: string;
  breakingNews: number;
  impactScore: number;
  sector: string;
  industry: string;
  grokRating: number;
  grokRec: string;
  grokReasoning: string;
  currentPrice: number;
  currentPricePct: number;
  highestPricePct: number;
  highest3DaysPricePct: number;
  lowest3DaysPricePct: number;
  entryDate: string;
  entryPrice: number;
  highestPrice: number;
  highest3DaysPrice: number;
  lowest3DaysPrice: number;
};

type NewsScore = {
  key: string;
  symbol: string;
  finnhubAggScore: number;
  lsegAggScore: number;
  avgAggScore: number;
  finnhubLatestDatetime: string;
  lsegLatestDatetime: string;
  finnhubTotalArticles: number;
  lsegTotalArticles: number;
  finnhubPositiveCount: number;
  finnhubNegativeCount: number;
  lsegPositiveCount: number;
  lsegNegativeCount: number;
  marketCapBillion: number;
  lsegBadBkCount: number;
  lsegGoodBkCount: number;
};

type NewsScoreBySymbol = {
  symbol: string;
  finnhubScore1d: number;
  finnhubScore3d: number;
  finnhubScore1w: number;
  lsegScore1d: number;
  lsegScore3d: number;
  lsegScore1w: number;
};
