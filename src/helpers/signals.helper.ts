import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformStrategyData = (strategies: any[]): Strategies => {
  return strategies.map((strategy) => ({
    id: strategy.id,
    name: strategy.name,
    groupName: strategy.group_name,
    description: strategy.description
  }));
};

export const transformSignalsData = (signals: any[]): Signal[] => {
  return signals.map((stock) => ({
    id: stock.id,
    key: uuid(),
    symbol: stock[fieldMapping.tickerName],
    companyName: stock[fieldMapping.companyName],
    earningDate: stock[fieldMapping.earningDate],
    isNews: stock[fieldMapping.isNews],
    totalScore: stock[fieldMapping.totalScore],
    fundamentalScore: stock[fieldMapping.fundamentalScore],
    sentimentScore: stock[fieldMapping.sentimentScore],
    earningsScore: stock[fieldMapping.earningsScore],
    ytd: stock[fieldMapping.ytd],
    currentPrice: stock[fieldMapping.currentPrice],
    volumeAVG: stock[fieldMapping.volumeAVG],
    beta: stock.beta,
    atr: stock.atr,
    strategyName: stock[fieldMapping.strategyName],
    timeFrame: stock[fieldMapping.timeFrame],
    entryDate: stock[fieldMapping.entryDate],
    entryPrice: Number(stock[fieldMapping.entryPrice] ?? 0),
    exitDate: stock[fieldMapping.exitDate],
    exitPrice: Number(stock[fieldMapping.exitPrice] ?? 0),
    highestPrice: stock[fieldMapping.highestPrice],
    highestUpdateAt: stock[fieldMapping.highestUpdateAt],
    lowestPrice: stock[fieldMapping.lowestPrice],
    lowestUpdateAt: stock[fieldMapping.lowestUpdateAt],
    marketCap: Number(stock[fieldMapping.marketCap] ?? 0),
    plPercent: Number(stock[fieldMapping.plPercent] ?? 0),
    atrPercent: stock[fieldMapping.atrPercent],
    isNewsNegative: stock[fieldMapping.isNewsNegative],
    recentNewsEarnings: stock[fieldMapping.recentNewsEarnings],
    lowestPrice3Days: stock[fieldMapping.lowestPrice3Days],
    lowestPrice7Days: stock[fieldMapping.lowestPrice7Days],
    highestPrice3Days: stock[fieldMapping.highestPrice3Days],
    highestPrice7Days: stock[fieldMapping.highestPrice7Days],
    recommendation: stock.recommendation,
    isImport: stock[fieldMapping.isImport],
    earningDate3days: stock[fieldMapping.earningDate3days]
  }));
};
