/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Form, Select } from 'antd';
import { useTranslations } from 'next-intl';
import FloatSelect from '../float-select';

type SelectFilterProps = {
  name: string;
  label?: string;
  options: { label: string; value: string }[];
  width?: string;
  onSelect: (value: string | undefined) => void;
  onClear: () => void;
  labelFloating?: boolean;
  value?: string;
};

export const SelectFilter = ({
  name,
  label,
  options,
  width = '14rem',
  labelFloating = false,
  onSelect,
  onClear,
  value
}: SelectFilterProps) => {
  const t = useTranslations();
  if (labelFloating) {
    return (
      <FloatSelect
        label={label || t('selectPlaceholderDefault')}
        options={options}
        allowClear
        width={width}
        value={value}
        placeholder=''
        onChange={(val) => onSelect(val)}
        onClear={onClear}
      />
    );
  }

  return (
    <Form.Item
      label={label ? <span css={labelStyles}>{label}</span> : undefined}
      css={formItemStyles}
      name={name}
    >
      <Select
        css={getInputStyles(width)}
        options={options}
        placeholder={label || t('selectPlaceholderDefault')}
        allowClear
        value={value}
        onChange={(val) => onSelect(val)}
        onClear={onClear}
      />
    </Form.Item>
  );
};

const labelStyles = css`
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.8rem;
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const getInputStyles = (width: string) => css`
  width: ${width} !important;
`;
