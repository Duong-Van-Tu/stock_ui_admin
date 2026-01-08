type SpikeVolumeM15Info = {
  smaVol: number;
  strikeVol: number;
  strikeTime: string;
  confirmVol: number;
  confirmPrice: number;
  confirmTime: string;
};

type SpikeVolumeH1Info = {
  smaVol: number;
  strikeVol: number;
  strikeTime: string;
};

type Signal = {
  id: number;
  hashAlertLogId: string;
  key: string;
  symbol: string;
  companyName: string;
  earningDate: string;
  isNews: boolean;
  totalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  earningsScore: number;
  ytd: number;
  currentPrice: number;
  volumeAVG: number;
  beta: number;
  atr: number;
  strategyName: string;
  timeFrame: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  highestPrice: number;
  highestUpdateAt: string;
  lowestPrice: number;
  lowestUpdateAt: string;
  marketCap: number;
  plPercent: number;
  atrPercent: number;
  isNewsNegative: boolean;
  recentNewsEarnings: boolean;
  lowestPrice3Days: number;
  lowestPrice7Days: number;
  highestPrice3Days: number;
  highestPrice7Days: number;
  recommendation: number;
  isImport: 0 | 1;
  earningDate3days: string;
  isNotes: boolean;
  scheduleExitDate: string;
  lowest3DaysUpdateAt: string;
  lowest7DaysUpdateAt: string;
  highest3DaysUpdateAt: string;
  highest7DaysUpdateAt: string;
  AIRating: number;
  AIRecommendationSignal: string;
  AIExplain: string;
  realCandleEntry: string;
  expectCandleEntry: string;
  manualRecommendation: string;
  stopLoss: number;
  takeProfit: number;
  highestPricePercent: number;
  lowestPricePercent: number;
  currentPricePercent: number;
  newStopLoss: number;
  rsi: number;
  stockInfo: StockInfo;
  spikeVolumeM15Info?: SpikeVolumeM15Info;
  spikeVolumeH1Info?: SpikeVolumeH1Info;
  performanceScore: number;
  isOptions: boolean;
  avgSentiment: number;
  verifyNews: boolean;
  isPutOptions: boolean;
  countSignal: number;
  grokRating: number;
  grokReasoning: string;
  grokRec: string;
  lsegNews: number;
  trend1d: string;
  trend1h: string;
  trend1w: string;
  macd5m: string;
  macd15m: string;
  macd1h: string;
  macd1d: string;
  categoryId?: number;
  categoryIds?: number[];
  allEntryGood?: boolean;
};

type AlertLogsFilter = Filter & {
  fromEntryDate?: Date | string;
  toEntryDate?: Date | string;
  fromExitDate?: Date | string;
  toExitDate?: Date | string;
  isImport?: 0 | 1;
  strategyId?: number;
  categoryId?: number;
  sector?: string;
  industry?: string;
  timeFrame?: string;
  macd?: string;
};

type Strategy = {
  id: number;
  name: string;
  groupName: string;
  description: string;
};

type Strategies = Strategy[];

type LatestHitOnePercent = {
  id: string;
  tickerName: string;
  currentPrice: number;
  entryDate: string;
  entryPrice: number;
  highestUpdateAt: string;
  highestPrice: number;
  hitPercent: string;
};

type LatestHitOnePercents = LatestHitOnePercent[];
