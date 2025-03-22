import { v4 as uuid } from 'uuid';

export const transformStockData = (stocks: any[]) => {
  return stocks.map((stock) => ({
    id: stock.id,
    key: uuid(),
    symbol: stock.symbol,
    companyName: stock.companyname,
    earningDate: stock.earning_date,
    isAdd: stock.isadd,
    isAddWatchList: stock.isaddwl,
    isNews: stock.isnews,
    totalScore: stock.totalscore,
    fundamentalScore: stock.fund_score,
    sentimentScore: stock.estimate_score,
    earningsScore: stock.earnings_score,
    ytd: stock.perf_ytd_value,
    dayChangePercent: stock.daychangepercent,
    price: stock.price,
    volume: stock.volume,
    beta: stock.beta,
    atr: stock.atr
  }));
};
