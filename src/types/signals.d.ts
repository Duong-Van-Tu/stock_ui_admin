type AlertLogs = {
  id: number;
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
};

type AlertLogsFilter = {
  symbol?: string;
  sortField?: string;
  sortType?: string;
};

type Strategy = {
  id: number;
  name: string;
  groupName: string;
  description: string;
};

type Strategies = Strategy[];
