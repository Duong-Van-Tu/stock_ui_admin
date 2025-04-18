import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformStockScoreData = (stocksScore: any[]): StockScore[] => {
  return stocksScore.map((stock) => ({
    id: stock.id,
    key: uuid(),
    symbol: stock.symbol,
    companyName: stock[fieldMapping.companyName],
    earningDate: stock[fieldMapping.earningDate],
    isAdd: stock[fieldMapping.isAdd],
    isAddWatchList: stock[fieldMapping.isAddWatchList],
    isNews: stock[fieldMapping.isNews],
    totalScore: stock[fieldMapping.totalScore],
    fundamentalScore: stock[fieldMapping.fundamentalScore],
    sentimentScore: stock[fieldMapping.sentimentScore],
    earningsScore: stock[fieldMapping.earningsScore],
    ytd: stock[fieldMapping.ytd],
    dayChangePercent: stock[fieldMapping.dayChangePercent],
    price: stock.price,
    volume: stock.volume,
    beta: stock.beta,
    atr: stock.atr,
    isNewsNegative: stock[fieldMapping.isNewsNegative]
  }));
};
