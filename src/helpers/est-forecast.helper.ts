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

    epsEstimate: toNumber(item[fieldMapping.epsEstimate]),
    reportedEps: toNumber(item[fieldMapping.reportedEps]),
    surprise: toNumber(item.surprise),
    prevEstimate: item[fieldMapping.prevEstimate],

    ytdPerformance: toNumber(item[fieldMapping.ytdPerformance]),
    aiRating: toNumber(item[fieldMapping.aiRating]),
    totalScoreEstForecast: toNumber(item[fieldMapping.totalScoreEstForecast]),

    routerRec: item[fieldMapping.routerRec],
    yahooRec: item[fieldMapping.yahooRec],
    priceTarget: toNumber(item[fieldMapping.priceTarget]),

    growth: item.growth,
    gpt: item.gpt,
    forecast: item.forecast,

    createdAt: item[fieldMapping.createdAt]
  }));
};
