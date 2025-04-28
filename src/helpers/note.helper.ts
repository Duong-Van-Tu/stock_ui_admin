import { fieldMapping } from './field-mapping.helper';

export const transformNote = (note: any): Note | null => {
  if (!note) return null;
  return {
    id: note.id,
    symbol: note.symbol,
    notes: note.notes,
    pageName: note[fieldMapping.pageName],
    upTo: note[fieldMapping.upTo],
    createdDate: note[fieldMapping.createdDate]
  };
};
