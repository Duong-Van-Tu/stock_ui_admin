import { fieldMapping } from '@/helpers/field-mapping.helper';

export enum AlertLogsView {
  STOCKS,
  OPTIONS
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
  SELL: 'sell'
};

export const RecommendationText: Record<string, string> = {
  [Recommendation.HOLD]: 'Hold',
  [Recommendation.BUY]: 'Buy',
  [Recommendation.STRONG_BUY]: 'Strong Buy',
  [Recommendation.SELL]: 'Sell'
};
