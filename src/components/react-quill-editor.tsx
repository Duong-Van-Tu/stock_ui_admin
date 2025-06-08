/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div style={{ height: '20rem' }}>Loading editor...</div>
});

type ReactQuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string | number;
  maxHeight?: string | number;
  className?: string;
  showImage?: boolean;
};

const getModules = (showImage: boolean = true) => ({
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ header: [1, 2, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', ...(showImage ? ['image'] : [])],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
});

const getFormats = (showImage: boolean = true) => [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'link',
  ...(showImage ? ['image'] : [])
];

export const ReactQuillEditor = ({
  value = '',
  onChange,
  placeholder,
  readOnly = false,
  height = '20rem',
  maxHeight,
  className,
  showImage = true
}: ReactQuillEditorProps) => {
  const [mounted, setMounted] = useState(false);
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  if (!mounted) {
    return (
      <div
        className={className}
        css={editorStyles(height, maxHeight)}
        style={{ border: '1px solid #ccc', borderRadius: '4px' }}
      />
    );
  }

  return (
    <div css={editorStyles(height, maxHeight)} className={className}>
      <ReactQuill
        value={editorValue}
        onChange={handleChange}
        modules={getModules(showImage)}
        formats={getFormats(showImage)}
        readOnly={readOnly}
        placeholder={placeholder}
        theme='snow'
      />
    </div>
  );
};

const editorStyles = (
  height: string | number,
  maxHeight?: string | number
) => css`
  .ql-editor {
    min-height: ${typeof height === 'number' ? `${height}px` : height};
    ${maxHeight
      ? `max-height: ${
          typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
        };`
      : ''}
    ${maxHeight ? 'overflow-y: auto;' : ''}
    font-size: 1.4rem;
    line-height: 1.5;
  }

  .ql-container {
    font-family: inherit;
    border-radius: 0 0 4px 4px;
  }

  .ql-toolbar {
    border-radius: 4px 4px 0 0;
    border: 1px solid #ccc;
  }

  .ql-container.ql-snow {
    border: 1px solid #ccc;
    border-top: none;
  }
`;
