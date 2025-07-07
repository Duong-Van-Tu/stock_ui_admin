type LedgerEntry = {
  id: number;
  symbol: string;
  entryDate: string;
  exitDate: string;
  strategy: string;
  period: string;
  action: string;
  strike: number;
  expiration: string;
  premiumPaid: number;
  premiumReceive: number;
  contracts: number;
  investmentCashOut: number;
  investmentCashIn: number;
  commission: number;
  exitPrice: number;
  entryPrice: number;
  stockPL: number;
  sector: string;
  notes: string;
  createDate: string;
};

type UserBalance = {
  userId: number;
  username: string;
  balance: number;
  balanceGain: number;
  totalAvailable: number;
  totalDeposit: number;
  totalDepositBalanceGain: number;
  totalWithdraw: number;
  totalWithdrawBalanceGain: number;
  timestamp: string;
};
