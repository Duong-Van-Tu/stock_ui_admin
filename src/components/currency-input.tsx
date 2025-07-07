import { Input } from 'antd';
import { InputProps } from 'antd';
import { useState } from 'react';

type CurrencyInputProps = Omit<InputProps, 'onChange' | 'value'> & {
  value?: number;
  onChange?: (value: number | undefined) => void;
};

export default function CurrencyInput({
  value,
  onChange,
  ...rest
}: CurrencyInputProps) {
  const [isFocusing, setIsFocusing] = useState(false);

  const formatNumber = (num: number) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const getDisplayValue = () => {
    if (isFocusing) {
      return value !== undefined ? String(value) : '';
    }
    return typeof value === 'number' ? formatNumber(value) : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');

    if (raw === '') {
      onChange?.(undefined);
      return;
    }

    if (!/^\d*\.?\d*$/.test(raw)) return;

    const num = Number(raw);
    if (!isNaN(num)) {
      onChange?.(num);
    }
  };

  const handleBlur = () => {
    setIsFocusing(false);
  };

  const handleFocus = () => {
    setIsFocusing(true);
  };

  return (
    <Input
      {...rest}
      type='text'
      inputMode='decimal'
      value={getDisplayValue()}
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
        if (pasteData.startsWith('-') || isNaN(Number(pasteData))) {
          e.preventDefault();
        }
      }}
      placeholder='0.00'
    />
  );
}
