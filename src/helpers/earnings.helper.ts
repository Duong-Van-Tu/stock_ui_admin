import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformEarningsSummary = (
  earningsSummary: any[]
): EarningsSummary[] => {
  if (earningsSummary.length <= 0) {
    return [];
  }

  return earningsSummary.map((earning) => ({
    date: earning.date,
    total: earning.total ? Number(earning.total) : 0
  }));
};

export const transformEarnings = (earnings: any[]): Earning[] => {
  if (earnings.length <= 0) {
    return [];
  }
  return earnings.map((earning) => ({
    id: earning.id,
    key: uuid(),
    symbol: earning.symbol,
    companyName: earning[fieldMapping.companyName],
    date: earning.date,
    earningsScore: earning.earnings_score,
    epsActual: earning.epsActual,
    epsEstimate: earning.epsEstimate,
    epsSurprise: earning[fieldMapping.epsSurprise],
    epsSurprisePercent: earning[fieldMapping.epsSurprisePercent],
    isAddWatchList: earning.isAddWL,
    marketCap: earning.marketCap ? Number(earning.marketCap) : undefined,
    revenueActual: earning.revenueActual,
    revenueEstimate: earning.revenueEstimate,
    revenueSurprise: earning[fieldMapping.revenueSurprise],
    revenueSurprisePercent: earning[fieldMapping.revenueSurprisePercent],
    isNews: earning[fieldMapping.isNews],
    isNewsNegative: earning[fieldMapping.isNewsNegative],
    avgSentiment: earning[fieldMapping.avgSentiment],
    currentPrice: earning[fieldMapping.currentPrice],
    highestPrice: earning[fieldMapping.highestPrice],
    lowestPrice: earning[fieldMapping.lowestPrice],
    intradayStockChart: earning.stockData,
    stockInfo: {
      totalScore: earning[fieldMapping.totalScore],
      fundamentalScore: earning[fieldMapping.fundamentalScore],
      sentimentScore: earning[fieldMapping.sentimentScore],
      earningsScore: earning[fieldMapping.earningsScore],
      performanceScore: earning[fieldMapping.performanceScore],
      beta: earning.beta,
      rsi: earning.rsi,
      atr: earning.atr
    }
  }));
};

export const transformEconomicCalendar = (data: any[]): EconomicCalendar[] => {
  if (!data || data.length <= 0) {
    return [];
  }
  return data.map((item) => ({
    id: item.id,
    start: item.start,
    name: item.name,
    impact: item.impact,
    description: item.description,
    source: item.source,
    volatility: item.volatility,
    periodType: item[fieldMapping.periodType]
  }));
};
