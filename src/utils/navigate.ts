export function withPrefix(path: string) {
  return path;
}

export namespace PageURLs {
  export function ofIndex() {
    return withPrefix('/home');
  }

  export function stockRanking() {
    return withPrefix('/stock-rankings');
  }

  export function ofLogin() {
    return withPrefix('/login');
  }

  export function ofRegister() {
    return withPrefix('/register');
  }
}
