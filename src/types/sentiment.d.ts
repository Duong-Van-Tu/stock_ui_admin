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

type GetCountSentimentParams = {
  symbol: string;
  query?: Record<string, any>;
};

type CompanyNews = {
  timestamp: string;
  headline: string;
  source: string;
  sentiment: Sentiment;
  impact: string;
  sentimentScore: number;
  sentimentScore1w: number;
  url: string;
};
