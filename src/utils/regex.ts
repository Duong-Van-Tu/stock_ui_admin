export const regex = {
  username: /^[a-zA-Z0-9_]{4,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?\d{10,15}$/,
  url: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
  ein: /^\d{2}-\d{7}$/,
  ssn: /^\d{3}-\d{2}-\d{4}$/,
  stockDetailPath: /^(\/[a-z]{2})?\/symbol\/[A-Za-z0-9.-]+$/,
  watchlistSwingTradeHistoryPath:
    /^(\/[a-z]{2})?\/watchlist-swing-trade\/history\/[A-Za-z0-9.-]+$/
};
