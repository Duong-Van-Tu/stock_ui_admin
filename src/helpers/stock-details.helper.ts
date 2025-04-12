import { fieldMapping } from './field-mapping.helper';

export const transformStockDetails = (stock: any): StockDetails | null => {
  if (!stock) return null;

  return {
    atr: stock.atr,
    beta: stock.beta,
    companyName: stock[fieldMapping.companyName],
    currency: stock.currency,
    dividendYieldIndicatedAnnual: stock.dividendYieldIndicatedAnnual,
    earningsScore: stock[fieldMapping.earningsScore],
    entryDate: stock[fieldMapping.entryDate],
    entryPrice: stock[fieldMapping.entryPrice]
      ? Number(stock[fieldMapping.entryPrice])
      : undefined,
    exitDate: stock[fieldMapping.exitDate],
    exitPrice: stock[fieldMapping.exitPrice]
      ? Number(stock[fieldMapping.exitPrice])
      : undefined,
    fundamentalScore: stock[fieldMapping.fundamentalScore],
    industry: stock.industry,
    isAddWatchList: stock[fieldMapping.isAddWatchList],
    last2Days: stock[fieldMapping.last2Days],
    lm: stock.lm,
    lw: stock.lw,
    marketCap: stock.marketCap ? Number(stock.marketCap) : undefined,
    marketCapTitle: stock[fieldMapping.marketCapTitle],
    sector: stock.sector,
    sentimentScore: stock[fieldMapping.sentimentScore],
    subIndustry: stock[fieldMapping.subIndustry],
    ticker: stock.ticker,
    totalScore: stock[fieldMapping.totalScore],
    volume: stock.volume,
    ytd: stock.ytd,
    week52High: stock[fieldMapping.week52High],
    week52HighDate: stock[fieldMapping.week52HighDate],
    week52Low: stock[fieldMapping.week52Low],
    week52LowDate: stock[fieldMapping.week52LowDate]
  };
};

export const transformFundamentalScore = (score: any): FundamentalScore => {
  const result: Partial<FundamentalScore> = {};

  for (const [key, mappedKey] of Object.entries(fieldMapping)) {
    result[key as keyof FundamentalScore] = Number(score?.[mappedKey]) || 0;
  }

  return result as FundamentalScore;
};
