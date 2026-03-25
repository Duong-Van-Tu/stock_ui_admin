import { fieldMapping } from '@/helpers/field-mapping.helper';

export enum AlertLogsView {
  STOCKS,
  OPTIONS,
  IN_TRADE,
  WATCHLIST,
  COUNT_MACD
}

export enum WatchlistView {
  STOCKS,
  ETF
}

export enum Sentiment {
  VeryNegative = 'very_negative',
  Negative = 'negative',
  Neutral = 'neutral',
  Positive = 'positive',
  VeryPositive = 'very_positive'
}

export enum Impact {
  Critical = 'critical',
  High = 'high',
  Moderate = 'moderate',
  Low = 'low'
}

export const Recommendation = {
  HOLD: 'hold',
  BUY: 'buy',
  STRONG_BUY: fieldMapping['strongBuy'],
  SELL: 'sell',
  sBuyE: 'sbuye',
  sBuyBS: 'sbuybs'
};

export const RecommendationText: Record<string, string> = {
  [Recommendation.HOLD]: 'Hold',
  [Recommendation.BUY]: 'Buy',
  [Recommendation.STRONG_BUY]: 'Strong Buy',
  [Recommendation.SELL]: 'Sell',
  [Recommendation.sBuyE]: 'Strong Buy (Earning)',
  [Recommendation.sBuyBS]: 'Strong Buy (Breakout + Spike)'
};

export enum GapDirection {
  GAP_UP = 'UP',
  GAP_DOWN = 'DOWN',
  NO_CHANGE = 'NO_CHANGE'
}

export enum PeriodOptions {
  OneDay = '1D',
  OneHour = '1H',
  ThirtyMinutes = '30M',
  FifteenMinutes = '15M',
  TenMinutes = '10M',
  FiveMinutes = '5M'
}

export const MARKET_PSYCH_DATA_TYPES = [
  { value: 'News', label: 'News' },
  { value: 'News_Headline', label: 'News Headline' },
  { value: 'News_Social', label: 'News Social' },
  { value: 'Social', label: 'Social' }
];
