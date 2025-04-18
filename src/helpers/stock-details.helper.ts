import { fieldMapping } from './field-mapping.helper';

export const initFundamentalScore = {
  ebitScore: 0,
  grossIncomeScore: 0,
  netIncomeScore: 0,
  revenueScore: 0,
  detailFundamentalScore: 0
};

export const initSentimentScore = {
  score1w: 0,
  score1m: 0,
  score3m: 0
};

export const initEarningsScore = {
  earningsScore: 0,
  epsActualScore: 0,
  epsEstimateScore: 0
};

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
  if (!score) {
    return initFundamentalScore;
  }
  return {
    ebitScore: score[fieldMapping.ebitScore] || 0,
    grossIncomeScore: score[fieldMapping.grossIncomeScore] || 0,
    netIncomeScore: score[fieldMapping.netIncomeScore] || 0,
    revenueScore: score[fieldMapping.revenueScore] || 0,
    detailFundamentalScore: score[fieldMapping.detailFundamentalScore] || 0
  };
};

export const transformFundamentalDetailScore = (
  scoreDetails: any[]
): FundamentalDetailScore[] => {
  if (scoreDetails.length <= 0) return [];

  return scoreDetails.map((detail) => ({
    year: detail.year,
    ebitMomentumScore: detail[fieldMapping.ebitMomentumScore],
    ebitRecentScore: detail[fieldMapping.ebitRecentScore],
    grossIncomeMomentumScore: detail[fieldMapping.grossIncomeMomentumScore],
    grossIncomeRecentScore: detail[fieldMapping.grossIncomeRecentScore],
    netIncomeMomentumScore: detail[fieldMapping.netIncomeMomentumScore],
    netIncomeRecentScore: detail[fieldMapping.netIncomeRecentScore],
    revenueMomentumScore: detail[fieldMapping.revenueMomentumScore],
    revenueRecentScore: detail[fieldMapping.revenueRecentScore],
    netMarginMomentumScore: detail[fieldMapping.netMarginMomentumScore],
    netMarginRecentScore: detail[fieldMapping.netMarginRecentScore]
  }));
};

export const transformSentimentScore = (score: any): SentimentScore => {
  if (!score) {
    return initSentimentScore;
  }
  return {
    score1w: score[fieldMapping.score1w],
    score1m: score[fieldMapping.score1m],
    score3m: score[fieldMapping.score3m]
  };
};

export const transformMovingSentimentScore = (
  scores: any[]
): MovingSentimentScore[] => {
  if (scores.length <= 0) return [];

  return scores.map((score) => ({
    timestamp: score.timestamp,
    score1w: score[fieldMapping.score1w],
    score1m: score[fieldMapping.score1m],
    score3m: score[fieldMapping.score3m]
  }));
};

export const transformEarningsScore = (score: any): EarningsScore => {
  if (!score) {
    return initEarningsScore;
  }

  return {
    earningsScore: score[fieldMapping.earningsScore],
    epsActualScore: score[fieldMapping.epsActualScore],
    epsEstimateScore: score[fieldMapping.epsEstimateScore]
  };
};

export const transformEarningsDetailScore = (
  scoreDetails: any[]
): EarningsDetailScore[] => {
  if (scoreDetails.length <= 0) return [];

  return scoreDetails.map((detail) => ({
    date: detail.date,
    epsActualMomentumScore: detail[fieldMapping.epsActualMomentumScore],
    epsActualRecentScore: detail[fieldMapping.epsActualRecentScore],
    epsEstimateMomentumScore: detail[fieldMapping.epsEstimateMomentumScore],
    epsEstimateRecentScore: detail[fieldMapping.epsEstimateRecentScore],
    surpriseRecentScore: detail[fieldMapping.surpriseRecentScore]
  }));
};

export const transformEarningsDetails = (details: any[]): EarningsDetails[] => {
  if (details.length <= 0) return [];

  return details.map((detail) => ({
    date: detail.date,
    epsActual: detail.epsActual ?? 0,
    epsEstimate: detail.epsEstimate ?? 0,
    surprise: detail.surprise ?? 0
  }));
};
