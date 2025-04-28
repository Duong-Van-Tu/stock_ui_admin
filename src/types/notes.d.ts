type NoteParams = {
  symbol: string;
  pageName: string;
  notes?: string;
};

type Note = {
  id: number;
  pageName: string;
  symbol: string;
  notes: string;
  upTo: boolean;
  createdDate: string;
};
