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

  export function ofAlertLogsFilter() {
    return withPrefix('/alert-filter');
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

  export function ofFinnhubLsegNews() {
    return withPrefix('/finnhub-lseg');
  }

  export function ofBreakingNewsAnalytics() {
    return withPrefix('/breaking-news-analytics');
  }

  export function ofInsightScore() {
    return withPrefix('/insight-score');
  }

  export function ofHighActivity() {
    return withPrefix('/high-activity');
  }

  export function ofStockDetail(symbol: string) {
    return withPrefix(`/symbol/${symbol}`);
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

  export function ofOptionChainCall() {
    return withPrefix('/option-chain-call');
  }
  export function ofOptionChainPut() {
    return withPrefix('/option-chain-put');
  }

  export function ofEstForecast() {
    return withPrefix('/forecast');
  }
  export function ofEarningSelection() {
    return withPrefix('/earning-selection');
  }
  export function ofLsegSelection() {
    return withPrefix('/lseg-selection');
  }
  export function ofMarketPsychology() {
    return withPrefix('/market-psychology');
  }
}
