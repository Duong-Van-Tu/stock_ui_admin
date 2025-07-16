import { Input } from 'antd';
import { InputProps } from 'antd';
import { useState, useEffect } from 'react';

type CurrencyInputProps = Omit<InputProps, 'onChange' | 'value'> & {
  value?: number;
  onChange?: (value: number | undefined) => void;
};

export default function CurrencyInput({
  value,
  onChange,
  ...rest
}: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (
      !document.activeElement ||
      (document.activeElement as HTMLElement).tagName !== 'INPUT'
    ) {
      if (typeof value === 'number') {
        setInputValue(
          value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
        );
      } else {
        setInputValue('');
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    raw = raw.replace(',', '.');

    if (!/^\d*(\.\d{0,})?$/.test(raw)) return;

    setInputValue(e.target.value);

    const numericValue = Number(raw);
    if (raw === '' || isNaN(numericValue)) {
      onChange?.(undefined);
    } else {
      onChange?.(numericValue);
    }
  };

  const handleBlur = () => {
    if (typeof value === 'number') {
      setInputValue(
        value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    }
  };

  const handleFocus = () => {
    if (typeof value === 'number') {
      const isInteger = Number.isInteger(value);
      setInputValue(isInteger ? String(Math.trunc(value)) : String(value));
    }
  };

  return (
    <Input
      {...rest}
      type='text'
      inputMode='decimal'
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyPress={(e) => {
        if (e.key === '-' || e.key === '+') {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        const pasteData = e.clipboardData.getData('text');
        const normalized = pasteData.replace(',', '.');
        if (normalized.startsWith('-') || isNaN(Number(normalized))) {
          e.preventDefault();
        }
      }}
      placeholder='0.00'
    />
  );
}
