import { fieldMapping } from './field-mapping.helper';

export const transformLedgerEntry = (entries: any[]): LedgerEntry[] => {
  if (entries.length <= 0) {
    return [];
  }

  return entries.map((entry) => ({
    id: entry.id,
    symbol: entry.symbol,
    entryDate: entry[fieldMapping.entryDate],
    exitDate: entry[fieldMapping.exitDate],
    strategy: entry.strategy,
    period: entry.period,
    action: entry.action,
    strike: entry.strike,
    expiration: entry.expiration,
    premiumPaid: entry[fieldMapping.premiumPaid],
    premiumReceive: entry[fieldMapping.premiumReceive],
    contracts: entry[fieldMapping.contracts],
    investmentCashOut: entry[fieldMapping.investmentCashOut],
    investmentCashIn: entry[fieldMapping.investmentCashIn],
    commission: entry.commission,
    exitPrice: entry[fieldMapping.exitPrice],
    entryPrice: entry[fieldMapping.entryPrice],
    stockPL: entry[fieldMapping.stockPL],
    sector: entry.sector,
    notes: entry.notes,
    createDate: entry[fieldMapping.createDate]
  }));
};

export const computeLedgerBalances = (
  entries: LedgerEntry[],
  initialBalance: number
) => {
  let balance = initialBalance;
  let cumulative = 0;
  let totalProfitLoss = 0;
  const balanceMap: Record<string, number> = {};
  const cumulativeMap: Record<string, number> = {};

  for (const entry of entries) {
    const { id, investmentCashOut, investmentCashIn, commission = 0 } = entry;

    if (
      typeof investmentCashOut !== 'number' ||
      typeof investmentCashIn !== 'number'
    ) {
      continue;
    }

    const gainLoss = investmentCashIn - investmentCashOut - commission;
    cumulative += gainLoss;
    balance += gainLoss;
    totalProfitLoss += gainLoss;

    balanceMap[id] = balance;
    cumulativeMap[id] = cumulative;
  }

  return {
    balanceMap,
    cumulativeMap,
    totalProfitLoss
  };
};
