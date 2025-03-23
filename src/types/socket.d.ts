type StockWithPrice = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
};
type MessageProps = {
  info: object[];
  realtime: IStockWithPrice[];
};

type WatchListItem = {
  symbol: string;
  isWatching: boolean;
};
