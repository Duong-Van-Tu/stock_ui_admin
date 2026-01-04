import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import { toNumber } from 'lodash';

export const transformEstForecast = (data: any[]): EstForecast[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    key: uuid(),

    symbol: item.symbol,
    company: item.company,
    industry: item.industry,

    callTime: item[fieldMapping.callTime],
    beta: toNumber(item.beta),

    marketCapEstForecast: item[fieldMapping.marketCapEstForecast],
    noteForTrader: item[fieldMapping.noteForTrader],

    epsEstimateESTEarnings: toNumber(item[fieldMapping.epsEstimateESTEarnings]),
    surprise: toNumber(item.surprise),

    ytdPerformance: toNumber(item[fieldMapping.ytdPerformance]),
    aiRating: toNumber(item[fieldMapping.aiRating]),

    yahooRec: item[fieldMapping.yahooRec],
    priceTarget: toNumber(item[fieldMapping.priceTarget]),

    grok: item.grok,
    gpt: item.gpt,
    forecast: item.forecast,

    earningsDate: item[fieldMapping.earningsDate],

    revenueForecast: toNumber(item[fieldMapping.revenueForecast]),
    revenueForecastPoint: toNumber(item[fieldMapping.revenueForecastPoint]),

    netMargin: toNumber(item[fieldMapping.netMargin]),
    netMarginPoint: toNumber(item[fieldMapping.netMarginPoint]),
    epsTrend: toNumber(item[fieldMapping.epsTrend]),
    epsTrendPoint: toNumber(item[fieldMapping.epsTrendPoint]),
    avgSurpriseMagnitude: toNumber(item[fieldMapping.avgSurpriseMagnitude]),
    avgSurpriseMagnitudePoint: toNumber(
      item[fieldMapping.avgSurpriseMagnitudePoint]
    ),
    epsBeatFreq: toNumber(item[fieldMapping.epsBeatFreq]),
    epsBeatFreqPoint: toNumber(item[fieldMapping.epsBeatFreqPoint]),
    revenueBeatFreq: toNumber(item[fieldMapping.revenueBeatFreq]),
    revenueBeatFreqPoint: toNumber(item[fieldMapping.revenueBeatFreqPoint]),

    postEarningDrift: toNumber(item[fieldMapping.postEarningDrift]),
    postEarningDriftPoint: toNumber(item[fieldMapping.postEarningDriftPoint]),

    grokRatingPoint: toNumber(item[fieldMapping.grokRatingPoint]),
    gptRating: toNumber(item[fieldMapping.gptRating]),
    gptRatingPoint: toNumber(item[fieldMapping.gptRatingPoint]),

    lsegNewsScore1d: toNumber(item[fieldMapping.lsegNewsScore1d]),
    lsegNewsScore1dPoint: toNumber(item[fieldMapping.lsegNewsScore1dPoint]),
    lsegNewsTotalScorePoint: toNumber(
      item[fieldMapping.lsegNewsTotalScorePoint]
    ),

    lsegNewsScore3d: toNumber(item[fieldMapping.lsegNewsScore3d]),
    lsegNewsScore3dPoint: toNumber(item[fieldMapping.lsegNewsScore3dPoint]),

    article12h: toNumber(item[fieldMapping.article12h]),
    article12hPoint: toNumber(item[fieldMapping.article12hPoint]),

    marketpsychEarningsDirectionZ: toNumber(
      item[fieldMapping.marketpsychEarningsDirectionZ]
    ),
    marketpsychEarningsForecastZ: toNumber(
      item[fieldMapping.marketpsychEarningsForecastZ]
    ),
    marketpsychRevenueDirectionZ: toNumber(
      item[fieldMapping.marketpsychRevenueDirectionZ]
    ),
    marketpsychRevenueForecastZ: toNumber(
      item[fieldMapping.marketpsychRevenueForecastZ]
    ),
    marketpsychPriceUpZ: toNumber(item[fieldMapping.marketpsychPriceUpZ]),
    marketpsychOptimismZ: toNumber(item[fieldMapping.marketpsychOptimismZ]),
    marketpsychTrustZ: toNumber(item[fieldMapping.marketpsychTrustZ]),

    aggregateScore: toNumber(item[fieldMapping.aggregateScore]),
    aggregateScorePoint: toNumber(item[fieldMapping.aggregateScorePoint])
  }));
};

export const transformEstForecastFilter = (
  data: any[]
): EstForecastFilterItem[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    key: uuid(),

    symbol: item.symbol,
    company: item.company,
    industry: item.industry,

    callTime: item[fieldMapping.callTime],
    beta: toNumber(item.beta),

    marketCapEstForecast: item[fieldMapping.marketCapEstForecast],
    marketCap: item.market_cap,

    noteForTrader: item[fieldMapping.noteForTrader],
    forecast: item.forecast,

    epsEstimateESTEarnings: toNumber(item[fieldMapping.epsEstimateESTEarnings]),
    epsEstimatePoint: toNumber(item[fieldMapping.epsEstimatePoint]),

    prevEstimate: item[fieldMapping.prevEstimate],

    revenueForecast: toNumber(item[fieldMapping.revenueForecast]),
    revenueForecastPoint: toNumber(item[fieldMapping.revenueForecastPoint]),

    netMargin: toNumber(item[fieldMapping.netMargin]),
    netMarginPoint: toNumber(item[fieldMapping.netMarginPoint]),

    epsTrend: toNumber(item[fieldMapping.epsTrend]),
    epsTrendPoint: toNumber(item[fieldMapping.epsTrendPoint]),

    avgSurpriseMagnitude: toNumber(item[fieldMapping.avgSurpriseMagnitude]),
    avgSurpriseMagnitudePoint: toNumber(
      item[fieldMapping.avgSurpriseMagnitudePoint]
    ),
    epsBeatFreq: toNumber(item[fieldMapping.epsBeatFreq]),
    epsBeatFreqPoint: toNumber(item[fieldMapping.epsBeatFreqPoint]),
    revenueBeatFreq: toNumber(item[fieldMapping.revenueBeatFreq]),
    revenueBeatFreqPoint: toNumber(item[fieldMapping.revenueBeatFreqPoint]),

    postEarningDrift: toNumber(item[fieldMapping.postEarningDrift]),
    postEarningDriftPoint: toNumber(item[fieldMapping.postEarningDriftPoint]),

    ytdPerformance: toNumber(item[fieldMapping.ytdPerformance]),
    ytdPerformancePoint: toNumber(item[fieldMapping.ytdPerformancePoint]),

    aiRating: toNumber(item[fieldMapping.aiRating]),
    aiRatingPoint: toNumber(item[fieldMapping.aiRatingPoint]),

    aggregateScore: toNumber(item[fieldMapping.aggregateScore]),
    aggregateScorePoint: toNumber(item[fieldMapping.aggregateScorePoint]),

    routerRec: item[fieldMapping.routerRec],
    yahooRec: item[fieldMapping.yahooRec],
    yahooRecPoint: toNumber(item[fieldMapping.yahooRecPoint]),

    priceTarget: toNumber(item[fieldMapping.priceTarget]),
    priceTargetPoint: toNumber(item[fieldMapping.priceTargetPoint]),

    grok: item.grok,
    grokPoint: toNumber(item[fieldMapping.grokPoint]),

    gpt: item.gpt,
    gptPoint: toNumber(item[fieldMapping.gptPoint]),
    gptRating: toNumber(item[fieldMapping.gptRating]),
    gptRatingPoint: toNumber(item[fieldMapping.gptRatingPoint]),

    lsegNewsScore1d: toNumber(item[fieldMapping.lsegNewsScore1d]),
    lsegNewsScore1dPoint: toNumber(item[fieldMapping.lsegNewsScore1dPoint]),
    lsegNewsTotalScorePoint: toNumber(
      item[fieldMapping.lsegNewsTotalScorePoint]
    ),

    lsegNewsScore3d: toNumber(item[fieldMapping.lsegNewsScore3d]),
    lsegNewsScore3dPoint: toNumber(item[fieldMapping.lsegNewsScore3dPoint]),

    article12h: toNumber(item[fieldMapping.article12h]),
    article12hPoint: toNumber(item[fieldMapping.article12hPoint]),

    marketpsychEarningsDirectionZ: toNumber(
      item[fieldMapping.marketpsychEarningsDirectionZ]
    ),
    marketpsychEarningsDirectionZPoint: toNumber(
      item[fieldMapping.marketpsychEarningsDirectionZPoint]
    ),

    marketpsychEarningsForecastZ: toNumber(
      item[fieldMapping.marketpsychEarningsForecastZ]
    ),
    marketpsychEarningsForecastZPoint: toNumber(
      item[fieldMapping.marketpsychEarningsForecastZPoint]
    ),

    marketpsychRevenueDirectionZ: toNumber(
      item[fieldMapping.marketpsychRevenueDirectionZ]
    ),
    marketpsychRevenueDirectionZPoint: toNumber(
      item[fieldMapping.marketpsychRevenueDirectionZPoint]
    ),

    marketpsychRevenueForecastZ: toNumber(
      item[fieldMapping.marketpsychRevenueForecastZ]
    ),
    marketpsychRevenueForecastZPoint: toNumber(
      item[fieldMapping.marketpsychRevenueForecastZPoint]
    ),

    marketpsychPriceUpZ: toNumber(item[fieldMapping.marketpsychPriceUpZ]),
    marketpsychPriceUpZPoint: toNumber(
      item[fieldMapping.marketpsychPriceUpZPoint]
    ),

    marketpsychOptimismZ: toNumber(item[fieldMapping.marketpsychOptimismZ]),
    marketpsychOptimismZPoint: toNumber(
      item[fieldMapping.marketpsychOptimismZPoint]
    ),

    marketpsychTrustZ: toNumber(item[fieldMapping.marketpsychTrustZ]),
    marketpsychTrustZPoint: toNumber(item[fieldMapping.marketpsychTrustZPoint]),

    earningsDate: item[fieldMapping.earningsDate],
    updatedAt: item[fieldMapping.updatedAt]
  }));
};
