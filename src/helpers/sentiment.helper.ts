import { Impact, Sentiment } from '@/constants/common.constant';
import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformCountSentiment = (sentiment: any): CountSentiment => {
  return {
    countNegative: sentiment[fieldMapping.countNegative]
      ? Number(sentiment[fieldMapping.countNegative])
      : 0,
    countPositive: sentiment[fieldMapping.countPositive]
      ? Number(sentiment[fieldMapping.countPositive])
      : 0,
    countVeryNegative: sentiment[fieldMapping.countVeryNegative]
      ? Number(sentiment[fieldMapping.countVeryNegative])
      : 0,
    countVeryPositive: sentiment[fieldMapping.countVeryPositive]
      ? Number(sentiment[fieldMapping.countVeryPositive])
      : 0
  };
};

export const transformCompanyNews = (companyNews: any[]): CompanyNews[] => {
  return companyNews.map((news) => ({
    key: uuid(),
    timestamp: news.timestamp,
    headline: news.headline,
    source: news.source,
    sentiment: news.sentiment,
    impact: news.impact,
    sentimentScore: news[fieldMapping.sentimentScore],
    sentimentScore1w: news[fieldMapping.sentimentScore1w],
    url: news.url
  }));
};

export const transformListWatcher = (listWatcher: any[]): ListWatcher[] => {
  if (listWatcher.length <= 0) {
    return [];
  }

  return listWatcher.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    groupStock: item[fieldMapping.groupStock],
    publishingTime: item[fieldMapping.publishingTime],
    headline: item.headline,
    source: item.source,
    sentiment: item.sentiment,
    impact: item.impact,
    url: item.url,
    beta: item.beta,
    avgVolume: item[fieldMapping.avgVolume],
    atr: item.atr,
    atrPercent: item[fieldMapping.atrPercent],
    fundamentalScore: item[fieldMapping.fundamentalScore],
    sentimentScore: item[fieldMapping.sentimentScore],
    earningsScore: item[fieldMapping.earningsScore],
    weekLow52: item[fieldMapping.weekLow52],
    weekHigh52: item[fieldMapping.weekHigh52],
    marketCapListWatcher: item[fieldMapping.marketCapListWatcher],
    industry: item.industry,
    sector: item.sector,
    subIndustry: item.subindustry,
    dateTime: item.datetime,
    earningDate: item[fieldMapping.earningDate],
    totalScore: item[fieldMapping.totalScore]
  }));
};

export const getSentimentText = (
  sentiment: Sentiment,
  t: (key: string) => string
): string => {
  const sentimentMap: Record<Sentiment, string> = {
    [Sentiment.VeryNegative]: t('veryNegative'),
    [Sentiment.Negative]: t('negative'),
    [Sentiment.Neutral]: t('neutral'),
    [Sentiment.Positive]: t('positive'),
    [Sentiment.VeryPositive]: t('veryPositive')
  };

  return sentimentMap[sentiment] || t('unknown');
};

export const isPositiveSentiment = (value: Sentiment): boolean => {
  return value === Sentiment.Positive || value === Sentiment.VeryPositive;
};

export const isNegativeSentiment = (value: Sentiment): boolean => {
  return value === Sentiment.Negative || value === Sentiment.VeryNegative;
};

export const getImpactColor = (impact: Impact): string => {
  switch (impact) {
    case Impact.Critical:
      return 'red';
    case Impact.High:
      return 'gold';
    case Impact.Low:
      return 'green';
    default:
      return 'cyan';
  }
};

export const transformListNewsLatest = (listNews: any[]): NewsLatest[] => {
  if (listNews.length === 0) {
    return [];
  }

  return listNews.map((item) => ({
    key: uuid(),
    timestamp: item.timestamp,
    symbol: item.symbol,
    headline: item.headline,
    source: item.source,
    sentiment: item.sentiment,
    impact: item.impact,
    sentimentScore1w: item.sentimentScore1w,
    sentimentScore: item.sentimentScore,
    sentimentScore1m: item.sentimentScore1m,
    sentimentScore3m: item.sentimentScore3m,
    url: item.url
  }));
};
