import { v4 as uuid } from 'uuid';

export const transformCountSentiment = (sentiment: any): CountSentiment => {
  return {
    countNegative: sentiment.count_negative
      ? Number(sentiment.count_negative)
      : 0,
    countPositive: sentiment.count_positive
      ? Number(sentiment.count_positive)
      : 0,
    countVeryNegative: sentiment.count_very_negative
      ? Number(sentiment.count_very_negative)
      : 0,
    countVeryPositive: sentiment.count_very_negative
      ? Number(sentiment.count_very_negative)
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
    sentimentScore: news.sentiment_score,
    sentimentScore1w: news.sentiment_score_1w,
    url: news.url
  }));
};

export const transformListWatcher = (listWatcher: any[]): ListWatcher[] => {
  return listWatcher.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    groupStock: item.groupstock,
    publishingTime: item.publishing_time,
    headline: item.headline,
    source: item.source,
    sentiment: item.sentiment,
    impact: item.impact,
    url: item.url,
    beta: item.beta,
    avgVolume: item.avg_volume,
    atr: item.atr,
    atrPercent: item.atrpercent,
    fundamentalScore: item.fund_score,
    sentimentScore: item.sentiment_score,
    earningsScore: item.earnings_score,
    weekLow52: item.week_low52,
    weekHigh52: item.week_high52,
    marketCapListWatcher: item.market_cap,
    industry: item.industry,
    sector: item.sector,
    subIndustry: item.subindustry,
    dateTime: item.datetime,
    earningDate: item.earning_date,
    totalScore: item.totalscore
  }));
};
