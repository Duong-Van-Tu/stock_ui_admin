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
    result: item.result,

    epsEstimateESTEarnings: toNumber(item[fieldMapping.epsEstimateESTEarnings]),
    surprise: toNumber(item.surprise),

    ytdPerformance: toNumber(item[fieldMapping.ytdPerformance]),
    aiRating: toNumber(item[fieldMapping.aiRating]),

    yahooRec: item[fieldMapping.yahooRec],
    priceTarget: toNumber(item[fieldMapping.priceTarget]),

    grok: item.grok,
    gpt: item.gpt,
    forecast: item.forecast,

    createdAt: item[fieldMapping.createdAt],

    revenueForecast: toNumber(item[fieldMapping.revenueForecast]),
    revenueForecastPoint: toNumber(item[fieldMapping.revenueForecastPoint]),

    netMargin: toNumber(item[fieldMapping.netMargin]),
    netMarginPoint: toNumber(item[fieldMapping.netMarginPoint]),

    epsTrend: toNumber(item[fieldMapping.epsTrend]),
    epsTrendPoint: toNumber(item[fieldMapping.epsTrendPoint]),

    beatFreq: toNumber(item[fieldMapping.beatFreq]),
    beatFreqPoint: toNumber(item[fieldMapping.beatFreqPoint]),

    avgSurpriseMagnitude: toNumber(item[fieldMapping.avgSurpriseMagnitude]),
    avgSurpriseMagnitudePoint: toNumber(
      item[fieldMapping.avgSurpriseMagnitudePoint]
    ),

    postEarningDrift: toNumber(item[fieldMapping.postEarningDrift]),
    postEarningDriftPoint: toNumber(item[fieldMapping.postEarningDriftPoint]),

    grokRatingPoint: toNumber(item[fieldMapping.grokRatingPoint]),
    gptRatingPoint: toNumber(item[fieldMapping.gptRatingPoint]),

    lsegNewsScore1d: toNumber(item[fieldMapping.lsegNewsScore1d]),
    lsegNewsScore1dPoint: toNumber(item[fieldMapping.lsegNewsScore1dPoint]),

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
    aggregateScorePoint: toNumber(item[fieldMapping.aggregateScorePoint]),

    noteForTrader: item[fieldMapping.noteForTrader]
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
    result: item.result,
    epsEstimateESTEarnings: toNumber(item[fieldMapping.epsEstimateESTEarnings]),
    reportedEps: toNumber(item[fieldMapping.reportedEps]),
    surprise: toNumber(item.surprise),
    prevEstimate: item[fieldMapping.prevEstimate],
    ytdPerformance: toNumber(item[fieldMapping.ytdPerformance]),
    aiRating: toNumber(item[fieldMapping.aiRating]),
    totalScoreEstForecast: toNumber(item[fieldMapping.totalScoreEstForecast]),
    routerRec: item[fieldMapping.routerRec],
    yahooRec: item[fieldMapping.yahooRec],
    priceTarget: toNumber(item[fieldMapping.priceTarget]),
    grok: item.grok,
    gpt: item.gpt,
    forecast: item.forecast,
    epsEstimatePoint: item[fieldMapping.epsEstimatePoint],
    prevEstimatePoint: item[fieldMapping.prevEstimatePoint],
    ytdPerformancePoint: item[fieldMapping.ytdPerformancePoint],
    aiRatingPoint: item[fieldMapping.aiRatingPoint],
    totalScorePoint: item[fieldMapping.totalScorePoint],
    yahooRecPoint: item[fieldMapping.yahooRecPoint],
    priceTargetPoint: item[fieldMapping.priceTargetPoint],
    grokPoint: item[fieldMapping.grokPoint],
    gptPoint: item[fieldMapping.gptPoint],
    createdAt: item[fieldMapping.createdAt],
    updatedAt: item[fieldMapping.updatedAt],
    importedFrom: item[fieldMapping.importedFrom]
  }));
};
