import { appSlice } from './slices/app.slice';
import { authSlice } from './slices/auth.slice';
import { earningsSlice } from './slices/earnings.slice';
import { highActivitySlice } from './slices/high-activity.slice';
import { notesSlice } from './slices/notes.slice';
import { searchSlice } from './slices/search';
import { SentimentSlice } from './slices/sentiment.slice';
import { signalSlice } from './slices/signals.slice';
import { stockDetailsSlice } from './slices/stock-details.slice';
import { stockScoreSlice } from './slices/stock-score.slice';
import { swingTradingWatchlistSlice } from './slices/swing-trading-watchlist.slice';

export const slices = [
  appSlice,
  authSlice,
  searchSlice,
  stockScoreSlice,
  signalSlice,
  earningsSlice,
  SentimentSlice,
  stockDetailsSlice,
  highActivitySlice,
  notesSlice,
  swingTradingWatchlistSlice
];
