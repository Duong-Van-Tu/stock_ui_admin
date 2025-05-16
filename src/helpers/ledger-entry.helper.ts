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
    premiumPay: entry[fieldMapping.premiumPay],
    premiumReceive: entry[fieldMapping.premiumReceive],
    contracts: entry[fieldMapping.contracts],
    investCashOut: entry[fieldMapping.investCashOut],
    investCashIn: entry[fieldMapping.investCashIn],
    commission: entry.commission,
    exitPrice: entry[fieldMapping.exitPrice],
    entryPrice: entry[fieldMapping.entryPrice],
    priceChange: entry[fieldMapping.priceChange],
    sector: entry.sector,
    notes: entry.notes,
    createDate: entry[fieldMapping.createDate]
  }));
};

export const computeLedgerBalances = (entries: LedgerEntry[]) => {
  let balance = 5000;
  let cumulative = 0;
  const balanceMap: Record<string, number> = {};
  const cumulativeMap: Record<string, number> = {};

  for (const entry of entries) {
    const { id, investCashOut, investCashIn, commission = 0 } = entry;

    if (typeof investCashOut !== 'number' || typeof investCashIn !== 'number') {
      continue;
    }

    const gainLoss = investCashIn - investCashOut - commission;
    cumulative += gainLoss;
    balance += gainLoss;

    balanceMap[id] = balance;
    cumulativeMap[id] = cumulative;
  }

  return { balanceMap, cumulativeMap };
};
