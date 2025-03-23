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
}
