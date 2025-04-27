import { Input } from 'antd';
import { useState } from 'react';

type NotesSignalProps = {
  symbol: string;
};

export const NotesSignal = ({ symbol }: NotesSignalProps) => {
  const [notes, setNotes] = useState('');

  return (
    <div>
      <div>NotesSignal: {symbol}</div>
      <Input.TextArea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder='Enter your notes here...'
        rows={4}
        style={{ marginTop: 8 }}
      />
    </div>
  );
};
