type StockScore = {
  id: number;
  key: string;
  symbol: string;
  companyName: string;
  earningDate: string;
  isAdd: boolean;
  isAddWatchList: boolean;
  isNews: boolean;
  totalScore: number;
  fundamentalScore: number;
  performanceScore: number;
  sentimentScore: number;
  earningsScore: number;
  ytd: number;
  dayChangePercent: number;
  price: number;
  volume: number;
  beta: number;
  atr: number;
  isNewsNegative: boolean;
};

type StockScoreFilter = Filter & {
  industry?: string;
  sector?: string;
};
