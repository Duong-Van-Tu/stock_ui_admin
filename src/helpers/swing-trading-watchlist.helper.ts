import { fieldMapping } from './field-mapping.helper';
import { v4 as uuid } from 'uuid';

export const transformWatchlist50Days = (data: any[]): WatchlistIn50Days[] => {
  if (data.length <= 0) {
    return [];
  }

  return data.map((item) => ({
    key: uuid(),
    symbol: item.symbol,
    period: item.period,
    AIRating: item[fieldMapping.AIRating],
    AIRecommendation: item[fieldMapping.AIRecommendation],
    AIExplain: item[fieldMapping.AIExplain],
    previousClose: item[fieldMapping.previousClose],
    lowest50: item[fieldMapping.lowest50],
    changeLowest50: item[fieldMapping.changeLowest50],
    highest50: item[fieldMapping.highest50],
    lowest20: item[fieldMapping.lowest20],
    changeLowest20: item[fieldMapping.changeLowest20],
    highest20: item[fieldMapping.highest20],
    average: item.average,
    median: item.median,
    sma50: item[fieldMapping.sma50],
    sma20: item[fieldMapping.sma20],
    yahooPriceTargetMean: item[fieldMapping.yahooPriceTargetMean],
    yahooPriceTargetHigh: item[fieldMapping.yahooPriceTargetHigh],
    yahooPriceTargetLow: item[fieldMapping.yahooPriceTargetLow],
    createdAt: item[fieldMapping.createdAt],
    buy: item.buy,
    strongBuy: item.strongBuy,
    sell: item.sell,
    strongSell: item.strongSell,
    hold: item.hold,
    marketCap: Number(item.marketCap),
    sector: item.sector,
    industry: item.industry,
    subindustry: item.subindustry,
    currentPriceWatchlist: item[fieldMapping.currentPriceWatchlist],
    previousPrice: item[fieldMapping.previousPrice]
  }));
};
