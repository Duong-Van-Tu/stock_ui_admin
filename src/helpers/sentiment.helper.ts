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
