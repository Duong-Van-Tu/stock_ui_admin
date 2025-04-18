import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformEarningsSummary = (
  earningsSummary: any[]
): EarningsSummary[] => {
  return earningsSummary.map((earning) => ({
    date: earning.date,
    total: earning.total ? Number(earning.total) : 0
  }));
};

export const transformEarnings = (earnings: any[]): Earning[] => {
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
    revenueSurprisePercent: earning[fieldMapping.revenueSurprisePercent]
  }));
};
