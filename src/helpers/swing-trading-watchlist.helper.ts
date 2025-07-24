import { fieldMapping } from './field-mapping.helper';
import { v4 as uuid } from 'uuid';

export const transformWatchlistSwingTrade = (
  data: any[]
): WatchlistSwingTrade[] => {
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
    changeLowest50Realtime: Number(item[fieldMapping.changeLowest50Realtime]),
    highest50: item[fieldMapping.highest50],
    lowest20: item[fieldMapping.lowest20],
    changeLowest20: item[fieldMapping.changeLowest20],
    changeLowest20Realtime: Number(item[fieldMapping.changeLowest20Realtime]),
    lowest10: item[fieldMapping.lowest10],
    changeLowest10: item[fieldMapping.changeLowest10],
    changeLowest10Realtime: Number(item[fieldMapping.changeLowest10Realtime]),
    highest20: item[fieldMapping.highest20],
    highest10: item[fieldMapping.highest10],
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
    marketCapWatchList: Number(item[fieldMapping.marketCapWatchList]),
    sector: item.sector,
    industry: item.industry,
    subindustry: item.subindustry,
    currentPriceWatchlist: item[fieldMapping.currentPriceWatchlist],
    previousPrice: item[fieldMapping.previousPrice],
    companyName: item.description,
    priceAfter4pm: item[fieldMapping.priceAfter4pm],
    timeAfter4pm: item[fieldMapping.timeAfter4pm],
    priceAfter8pm: item[fieldMapping.priceAfter8pm],
    timeAfter8pm: item[fieldMapping.timeAfter8pm],
    priceBefore9am: item[fieldMapping.priceBefore9am],
    timeBefore9am: item[fieldMapping.timeBefore9am],
    percentGap: Number(item[fieldMapping.percentGap]),
    gapType: item[fieldMapping.gapType]
  }));
};

export const transformHistoryWatchlistSwingTrade = (
  data: any[]
): HistoryWatchlistSwingTrade[] => {
  if (data.length === 0) return [];

  return data.map((item) => ({
    key: uuid(),
    id: item.id,
    symbol: item.symbol,
    period: item.period,
    lowest50: item[fieldMapping.lowest50],
    highest50: item[fieldMapping.highest50],
    average: item.average,
    current: item.current,
    median: item.median,
    sma50: item[fieldMapping.sma50],
    suggestLowBuy50: item[fieldMapping.suggestLowBuy50],
    suggestHighBuy50: item[fieldMapping.suggestHighBuy50],
    createdAt: item[fieldMapping.createdAt],
    aiRating: item[fieldMapping.AIRating],
    aiRecommendation: item[fieldMapping.AIRecommendation],
    aiExplain: item[fieldMapping.AIExplain],
    sma20: item[fieldMapping.sma20],
    highest20: item[fieldMapping.highest20],
    lowest20: item[fieldMapping.lowest20],
    changePctLowest20: item[fieldMapping.changeLowest20],
    changePctLowest50: item[fieldMapping.changeLowest50],
    suggestLowBuy20: item[fieldMapping.suggestLowBuy20],
    suggestHighBuy20: item[fieldMapping.suggestHighBuy20],
    sma10: item[fieldMapping.sma10],
    highest10: item[fieldMapping.highest10],
    lowest10: item[fieldMapping.lowest10],
    changePctLowest10: item[fieldMapping.changeLowest10],
    suggestLowBuy10: item[fieldMapping.suggestLowBuy10],
    suggestHighBuy10: item[fieldMapping.suggestHighBuy10]
  }));
};
