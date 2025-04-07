type SentimentFilter = {
  date: string;
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
  query?: Record<string, any>;
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
};
