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
