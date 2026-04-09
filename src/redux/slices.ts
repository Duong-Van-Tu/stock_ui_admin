import { appSlice } from './slices/app.slice';
import { authSlice } from './slices/auth.slice';
import { earningsSlice } from './slices/earnings.slice';
import { estForecastSlice } from './slices/est-forecast.slice';
import { highActivitySlice } from './slices/high-activity.slice';
import { ledgerEntrySlice } from './slices/ledger-entry.slice';
import { lsegSelectionSlice } from './slices/lseg-selection.slice';
import { membersSlice } from './slices/members.slice';
import { notesSlice } from './slices/notes.slice';
import { optionChangesSlice } from './slices/options-changes.slice';
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
  lsegSelectionSlice,
  notesSlice,
  swingTradingWatchlistSlice,
  ledgerEntrySlice,
  membersSlice,
  optionChangesSlice,
  estForecastSlice
];
