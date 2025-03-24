import { v4 as uuid } from 'uuid';

export const transformStrategyData = (strategies: any[]): Strategies => {
  return strategies.map((strategy) => ({
    id: strategy.id,
    name: strategy.name,
    groupName: strategy.group_name,
    description: strategy.description
  }));
};

export const transformAlertLogsData = (alertLogs: any[]): AlertLogs[] => {
  return alertLogs.map((stock) => ({
    id: stock.id,
    key: uuid(),
    symbol: stock.ticker_name,
    companyName: stock.companyname,
    earningDate: stock.earning_date,
    isNews: stock.isnews,
    totalScore: stock.totalscore,
    fundamentalScore: stock.fund_score,
    sentimentScore: stock.sentiment_score,
    earningsScore: stock.earnings_score,
    ytd: stock.perf_ytd_value,
    currentPrice: stock.current_price,
    volumeAVG: stock.volumeavg,
    beta: stock.beta,
    atr: stock.atr,
    strategyName: stock.strategy_name,
    timeFrame: stock.time_frame,
    entryDate: stock.entry_date,
    entryPrice: Number(stock.entry_price ?? 0),
    exitDate: stock.exit_date,
    exitPrice: Number(stock.exit_price ?? 0),
    highestPrice: stock.highest_price,
    highestUpdateAt: stock.highest_update_at,
    lowestPrice: stock.lowest_price,
    lowestUpdateAt: stock.lowest_update_at,
    marketCap: Number(stock.marketcap ?? 0),
    plPercent: Number(stock.pl_percent ?? 0)
  }));
};
