export function withPrefix(path: string) {
  return path;
}

export namespace PageURLs {
  export function ofIndex() {
    return withPrefix('/home');
  }

  export function ofLogin() {
    return withPrefix('/login');
  }

  export function ofRegister() {
    return withPrefix('/register');
  }

  export function ofStockRanking() {
    return withPrefix('/stock-rankings');
  }

  export function ofAlertLogs() {
    return withPrefix('/alert-logs');
  }

  export function ofEarings() {
    return withPrefix('/earnings');
  }

  export function ofNews() {
    return withPrefix('/news');
  }

  export function ofAISentiment() {
    return withPrefix('/AI-sentiment');
  }

  export function ofHighActivity() {
    return withPrefix('/high-activity');
  }

  export function ofStockDetail(symbol: string, signalId?: number) {
    let url = `/symbol/${symbol}`;
    if (signalId) {
      url += `?signalId=${signalId}`;
    }
    return withPrefix(url);
  }

  export function ofWatchListSwingTrade() {
    return withPrefix('/watchlist-swing-trade');
  }

  export function ofHistoryWatchListSwingTrade(symbol: string) {
    return withPrefix(`/watchlist-swing-trade/history/${symbol}`);
  }

  export function ofWatchListSwingTradeChart() {
    return withPrefix(`/watchlist-swing-trade/chart`);
  }

  export function ofLedgerEntry() {
    return withPrefix('/ledger-entry');
  }

  export function ofAddLedgerEntry() {
    return withPrefix('/ledger-entry/add');
  }

  export function ofEditLedgerEntry(id: number) {
    return withPrefix(`/ledger-entry/edit/${id}`);
  }

  export function ofSendAlertLedgerEntry(id: number) {
    return withPrefix(`/ledger-entry/${id}/send-alert`);
  }
}
