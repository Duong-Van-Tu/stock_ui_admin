/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Select } from 'antd';
import { useTranslations } from 'next-intl';

type SelectFilterProps = {
  name: string;
  label?: string;
  options: { label: string; value: string | number }[];
  width?: string;
  onSelect: (value: string) => void;
  onClear: () => void;
};

export const SelectFilter = ({
  name,
  label,
  options,
  width = '14rem',
  onSelect,
  onClear
}: SelectFilterProps) => {
  const t = useTranslations();
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
        onSelect={onSelect}
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
