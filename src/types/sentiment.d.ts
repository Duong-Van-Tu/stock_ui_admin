type SentimentFilter = Filter & {
  lastHours?: number;
  group?: string;
  sentiment?: string;
  impact?: string;
  fromDate?: string;
  toDate?: string;
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
  title: string;
  sentiment: number;
  versionCreated: string;
  story?: string;
};
