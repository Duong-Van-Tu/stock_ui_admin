import { fieldMapping } from './field-mapping.helper';

export const transformWatchlist50Days = (data: any[]): WatchlistIn50Days[] => {
  if (data.length <= 0) {
    return [];
  }

  return data.map((item) => ({
    symbol: item.symbol,
    current: item.current,
    average: item.average,
    median: item.median,
    sma50: item[fieldMapping.sma50],
    highest: item.highest,
    lowest: item.lowest,
    suggestHighBuy: item[fieldMapping.suggestHighBuy],
    suggestLowBuy: item[fieldMapping.suggestLowBuy],
    yahooPriceTargetMean: item[fieldMapping.yahooPriceTargetMean],
    yahooPriceTargetHigh: item[fieldMapping.yahooPriceTargetHigh],
    yahooPriceTargetLow: item[fieldMapping.yahooPriceTargetLow],
    buy: item.buy,
    strongBuy: item.strongBuy,
    sell: item.sell,
    strongSell: item.strongSell,
    hold: item.hold,
    recommendPercent: item[fieldMapping.recommendPercent]
  }));
};
