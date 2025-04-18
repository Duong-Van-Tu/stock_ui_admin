import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformListHighActivity = (data: any[]): ListHighActivity[] => {
  if (data.length <= 0) return [];

  return data.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    marketCapHighActivity: item[fieldMapping.marketCapHighActivity],
    sentimentScore: item[fieldMapping.sentimentScore],
    atr: item.atr,
    avgVolume: item[fieldMapping.avgVolume],
    beta: item.beta,
    fundamentalScore: item[fieldMapping.fundamentalScore],
    earningsScore: item[fieldMapping.earningsScore],
    underWillrMinus80: item[fieldMapping.underWillrMinus80],
    drop3Pct: item[fieldMapping.drop3Pct],
    drop5Pct: item[fieldMapping.drop5Pct],
    drop1_5Pct: item[fieldMapping.drop1_5Pct],
    underSma200: item[fieldMapping.underSma200],
    underSma50: item[fieldMapping.underSma50],
    datetime: item.datetime,
    dropPct: item[fieldMapping.dropPct],
    dropPct2prev: item[fieldMapping.dropPct2prev],
    drop3Pct2prev: item[fieldMapping.drop3Pct2prev],
    drop5Pct2prev: item[fieldMapping.drop5Pct2prev],
    drop10Pct2prev: item[fieldMapping.drop10Pct2prev],
    timeframe: item.timeframe,
    criticalNews: item.critical_news,
    nextEarning: item.next_earning,
    epsEstimate: item[fieldMapping.epsEstimate],
    dropPctSma200: item[fieldMapping.dropPctSma200],
    dropPct2prevSma200: item[fieldMapping.dropPct2prevSma200]
  }));
};
