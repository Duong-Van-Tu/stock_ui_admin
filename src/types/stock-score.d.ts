type StockScore = {
  id: number;
  symbol: string;
  companyName: string;
  earningDate: string;
  isAdd: boolean;
  isAddWatchList: boolean;
  isNews: boolean;
  totalScore: number;
  fundamentalScore: number;
  sentimentScore: number;
  earningsScore: number;
  ytd: number;
  dayChangePercent: number;
  price: number;
  volume: number;
  beta: number;
  atr: number;
};
