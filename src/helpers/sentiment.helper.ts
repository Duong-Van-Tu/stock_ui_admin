import { Impact, Sentiment } from '@/constants/common.constant';
import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import { scaleScore } from '@/utils/common';

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
    totalScore: item[fieldMapping.totalScore],
    stockInfo: {
      totalScore: item[fieldMapping.totalScore],
      fundamentalScore: item[fieldMapping.fundamentalScore],
      sentimentScore: item[fieldMapping.sentimentScore],
      earningsScore: item[fieldMapping.earningsScore],
      beta: item.beta,
      rsi: item.rsi,
      atr: item.atr
    }
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

export const transformLisNewsSentiment = (listNews: any[]): NewsSentiment[] => {
  if (listNews.length === 0) {
    return [];
  }

  return listNews.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    symbols: item.symbol.split(',').map((sym: string) => sym.trim()),
    title: item.title,
    sentiment: item.sentiment,
    urgency: item.urgency,
    versionCreated: item[fieldMapping.versionCreated],
    story: item[fieldMapping.storyText],
    source: item[fieldMapping.source]
  }));
};

export const transformFinnhubAndLsegNews = (
  list: any[] = []
): FinnhubAndLsegNewsTableItem[] => {
  if (!list?.length) return [];
  return list.map((item) => ({
    key: uuid(),
    id: item.id,
    symbol: item.symbol,
    datetime: item.datetime,
    headline: item.headline,
    image: item.image,
    source: item.source,
    summary: item.summary,
    url: item.url,
    createDate: item[fieldMapping.createDate],
    newsRelevance: item[fieldMapping.newsRelevance],
    newsScore: scaleScore(item[fieldMapping.newsScore]),
    articleScore: scaleScore(item[fieldMapping.articleScore]),
    weightedScore: scaleScore(item[fieldMapping.weightedScore]),
    impactScore: scaleScore(item[fieldMapping.impactScore]),
    timeWeight: item[fieldMapping.timeWeight],
    direction: item.direction,
    horizon: item.horizon,
    newsType: item[fieldMapping.newsType],
    sourceType: item[fieldMapping.sourceType],
    breakingNews: Number(item[fieldMapping.breakingNews]),
    sector: item.sector,
    industry: item.industry,
    grokRating: item[fieldMapping.grokRating],
    grokRec: item[fieldMapping.grokRec],
    grokReasoning: item[fieldMapping.grokReasoning],
    currentPrice: item[fieldMapping.currentPrice],
    currentPricePct: item[fieldMapping.currentPricePct],
    highestPricePct: item[fieldMapping.highestPricePct],
    highest3DaysPricePct: item[fieldMapping.highest3DaysPricePct],
    lowest3DaysPricePct: item[fieldMapping.lowest3DaysPricePct],
    entryDate: item[fieldMapping.entryDate],
    entryPrice: item[fieldMapping.entryPrice],
    highestPrice: item[fieldMapping.highestPrice],
    highest3DaysPrice: item[fieldMapping.highestPrice3Days],
    lowest3DaysPrice: item[fieldMapping.lowestPrice3Days],
    highestUpdateAt: item[fieldMapping.highestUpdateAt],
    highest3DaysUpdateAt: item[fieldMapping.highest3DaysUpdateAt],
    lowest3DaysUpdateAt: item[fieldMapping.lowest3DaysUpdateAt],
    topNewsMetadata: item[fieldMapping.topNewsMetadata]
  }));
};

export const transformNewsScores = (list: any[] = []): NewsScore[] => {
  return list.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    finnhubAggScore: Number(item[fieldMapping.finnhubAggScore]),
    lsegAggScore: Number(item[fieldMapping.lsegAggScore]),
    avgAggScore: Number(item[fieldMapping.avgAggScore]),
    finnhubTotalArticles: Number(item[fieldMapping.finnhubTotalArticles]),
    finnhubNegativeCount: Number(item[fieldMapping.finnhubNegativeCount]),
    lsegTotalArticles: Number(item[fieldMapping.lsegTotalArticles]),
    finnhubLatestDatetime: item[fieldMapping.finnhubLatestDatetime],
    lsegLatestDatetime: item[fieldMapping.lsegLatestDatetime],
    marketCapBillion: Number(item[fieldMapping.marketCapBillion]),
    lsegNegativeCount: Number(item[fieldMapping.lsegNegativeCount]),
    lsegPositiveCount: Number(item[fieldMapping.lsegPositiveCount]),
    finnhubPositiveCount: Number(item[fieldMapping.finnhubPositiveCount]),
    lsegBadBkCount: Number(item[fieldMapping.lsegBadBkCount]),
    lsegGoodBkCount: Number(item[fieldMapping.lsegGoodBkCount])
  }));
};

export const transformNewsScoreBySymbol = (data: any): NewsScoreBySymbol => ({
  symbol: data.symbol,
  finnhubScore1d: Number(data.finnhub_score_1d),
  finnhubScore3d: Number(data.finnhub_score_3d),
  finnhubScore1w: Number(data.finnhub_score_1w),
  lsegScore1d: Number(data.lseg_score_1d),
  lsegScore3d: Number(data.lseg_score_3d),
  lsegScore1w: Number(data.lseg_score_1w)
});

export const transformBreakingNews = (list: any[] = []): BreakingNews[] => {
  if (!list?.length) return [];
  return list.map((item) => ({
    key: uuid(),
    storyId: item[fieldMapping.storyId],
    datetime: item.datetime,
    datetimeNyt: item[fieldMapping.datetimeNyt],
    symbol: item.symbol,
    title: item.title,
    articleScore: Number(item[fieldMapping.articleScore]),
    sentiment: Number(item.sentiment),
    relevance: Number(item[fieldMapping.relevance]),
    direction: Number(item.direction),
    horizonName: item[fieldMapping.horizonName],
    typeName: item[fieldMapping.typeName],
    impactScore: Number(item[fieldMapping.impactScore]),
    timeWeight: Number(item[fieldMapping.timeWeight]),
    breakingNews: Number(item[fieldMapping.breakingNews]),
    marketCapBillion: Number(item[fieldMapping.marketCapBillion]),
    sector: item.sector,
    industry: item.industry,
    newsCategory: item[fieldMapping.newsCategory]
  }));
};

export const transformMarketPsychLatest = (list: any[] = []): MarketPsych[] => {
  if (!list?.length) return [];

  return list.map((item) => ({
    key: uuid(),
    assetCode: item[fieldMapping.assetCode],
    ticker: item.ticker,
    windowTimestamp: item[fieldMapping.windowTimestamp],
    dataType: item[fieldMapping.dataType],
    systemVersion: item[fieldMapping.systemVersion],
    mentionsScore: item[fieldMapping.mentionsScore],
    buzz: item.buzz,
    psychSentimentScore: item[fieldMapping.psychSentimentScore],
    loveHateScore: item[fieldMapping.loveHateScore],
    trustScore: item[fieldMapping.trustScore],
    disagreementScore: item[fieldMapping.disagreementScore],
    emotionVsFactScore: item[fieldMapping.emotionVsFactScore],
    shortVsLongTermScore: item[fieldMapping.shortVsLongTermScore],
    longShortScore: item[fieldMapping.longShortScore],
    longShortForecastScore: item[fieldMapping.longShortForecastScore],
    priceDirectionScore: item[fieldMapping.priceDirectionScore],
    priceForecastScore: item[fieldMapping.priceForecastScore],
    marketRiskScore: item[fieldMapping.marketRiskScore],
    topVsBottomScore: item[fieldMapping.topVsBottomScore],
    overvaluedVsUndervaluedScore:
      item[fieldMapping.overvaluedVsUndervaluedScore],
    analystRatingScore: item[fieldMapping.analystRatingScore],
    dividendsScore: item[fieldMapping.dividendsScore],
    earningsDirectionScore: item[fieldMapping.earningsDirectionScore],
    earningsForecastScore: item[fieldMapping.earningsForecastScore],
    accountingSentimentScore: item[fieldMapping.accountingSentimentScore],
    revenueDirectionScore: item[fieldMapping.revenueDirectionScore],
    revenueForecastScore: item[fieldMapping.revenueForecastScore],
    intangiblesSentimentScore: item[fieldMapping.intangiblesSentimentScore],
    productSentimentScore: item[fieldMapping.productSentimentScore],
    laborDisputeScore: item[fieldMapping.laborDisputeScore],
    layoffsScore: item[fieldMapping.layoffsScore],
    litigationScore: item[fieldMapping.litigationScore],
    insiderLongShortScore: item[fieldMapping.insiderLongShortScore],
    managementSentimentScore: item[fieldMapping.managementSentimentScore],
    managementChangeScore: item[fieldMapping.managementChangeScore],
    managementTrustScore: item[fieldMapping.managementTrustScore],
    priceUpScore: item[fieldMapping.priceUpScore],
    priceDownScore: item[fieldMapping.priceDownScore],
    volatilityScore: item[fieldMapping.volatilityScore],
    debtDefaultScore: item[fieldMapping.debtDefaultScore],
    innovationScore: item[fieldMapping.innovationScore],
    accountingNegativeScore: item[fieldMapping.accountingNegativeScore],
    accountingPositiveScore: item[fieldMapping.accountingPositiveScore],
    accountingRestatementScore: item[fieldMapping.accountingRestatementScore],
    partnershipScore: item[fieldMapping.partnershipScore],
    mergersScore: item[fieldMapping.mergersScore],
    cyberCrimeScore: item[fieldMapping.cyberCrimeScore],
    futureVsPastScore: item[fieldMapping.futureVsPastScore],
    negativeScore: item[fieldMapping.negativeScore],
    positiveScore: item[fieldMapping.positiveScore],
    optimismScore: item[fieldMapping.optimismScore],
    pessimismScore: item[fieldMapping.pessimismScore],
    joyScore: item[fieldMapping.joyScore],
    angerScore: item[fieldMapping.angerScore],
    fearScore: item[fieldMapping.fearScore],
    gloomScore: item[fieldMapping.gloomScore],
    stressScore: item[fieldMapping.stressScore],
    surpriseScore: item[fieldMapping.surpriseScore],
    timeUrgencyScore: item[fieldMapping.timeUrgencyScore],
    uncertaintyScore: item[fieldMapping.uncertaintyScore],
    violenceScore: item[fieldMapping.violenceScore],
    hour: item.hour,
    day: item.day,
    updatedAt: item[fieldMapping.updatedAt],
    mentions: item.mentions,
    sentiment: item.sentiment,
    loveHate: item[fieldMapping.loveHate],
    trust: item.trust,
    disagreement: item.disagreement,
    emotionVsFact: item[fieldMapping.emotionVsFact],
    shortVsLongTerm: item[fieldMapping.shortVsLongTerm],
    longShort: item[fieldMapping.longShort],
    longShortForecast: item[fieldMapping.longShortForecast],
    priceDirection: item[fieldMapping.priceDirection],
    priceForecast: item[fieldMapping.priceForecast],
    marketRisk: item[fieldMapping.marketRisk],
    topVsBottom: item[fieldMapping.topVsBottom],
    overvaluedVsUndervalued: item[fieldMapping.overvaluedVsUndervalued],
    earningsDirection: item[fieldMapping.earningsDirection],
    earningsForecast: item[fieldMapping.earningsForecast],
    accountingSentiment: item[fieldMapping.accountingSentiment],
    revenueDirection: item[fieldMapping.revenueDirection],
    revenueForecast: item[fieldMapping.revenueForecast],
    intangiblesSentiment: item[fieldMapping.intangiblesSentiment],
    productSentiment: item[fieldMapping.productSentiment],
    laborDispute: item[fieldMapping.laborDispute],
    insiderLongShort: item[fieldMapping.insiderLongShort],
    managementSentiment: item[fieldMapping.managementSentiment],
    managementChange: item[fieldMapping.managementChange],
    managementTrust: item[fieldMapping.managementTrust],
    priceUp: item[fieldMapping.priceUp],
    priceDown: item[fieldMapping.priceDown],
    volatility: item.volatility,
    debtDefault: item[fieldMapping.debtDefault],
    innovation: item.innovation,
    accountingNegative: item[fieldMapping.accountingNegative],
    accountingPositive: item[fieldMapping.accountingPositive],
    accountingRestatement: item[fieldMapping.accountingRestatement],
    mergers: item.mergers,
    cyberCrime: item[fieldMapping.cyberCrime],
    futureVsPast: item[fieldMapping.futureVsPast],
    negative: item.negative,
    positive: item.positive,
    optimism: item.optimism,
    pessimism: item.pessimism,
    gloom: item.gloom,
    stress: item.stress,
    timeUrgency: item[fieldMapping.timeUrgency],
    uncertainty: item.uncertainty,
    violence: item.violence,
    rn: item.rn,
    totalCount: item[fieldMapping.totalCount]
  }));
};
