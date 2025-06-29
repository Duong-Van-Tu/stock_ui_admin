/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState, FocusEvent } from 'react';
import { Input } from 'antd';

interface FloatInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FloatInput({
  label,
  value,
  placeholder,
  type = 'text',
  required = false,
  onChange
}: FloatInputProps) {
  const [focus, setFocus] = useState(false);

  const displayPlaceholder = placeholder || label;
  const isOccupied = focus || (!!value && value.length !== 0);

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setFocus(false);
    }
  };

  return (
    <div
      css={floatLabelStyle}
      onBlur={handleBlur}
      onFocus={() => setFocus(true)}
      tabIndex={-1}
    >
      <Input onChange={onChange} type={type} defaultValue={value} />
      <label css={[labelStyle, isOccupied ? asLabelStyle : asPlaceholderStyle]}>
        {isOccupied ? label : displayPlaceholder}
        {required && <span css={textDanger}>*</span>}
      </label>
    </div>
  );
}

const floatLabelStyle = css`
  position: relative;
`;

const labelStyle = css`
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 1.2rem;
  top: 1.1rem;
  transition: 0.2s ease all;
`;

const asPlaceholderStyle = css`
  color: var(--gray-color);
`;

const asLabelStyle = css`
  top: -0.8rem;
  font-size: 1.2rem !important;
  background: white;
  padding: 0 0.4rem;
  margin-left: -0.4rem;
`;

const textDanger = css`
  color: var(--negative-color);
`;
