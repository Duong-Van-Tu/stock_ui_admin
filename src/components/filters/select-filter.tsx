/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Select } from 'antd';

type SelectFilterProps = {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  onClear: () => void;
};

export const SelectFilter = ({
  name,
  label,
  options,
  onSelect,
  onClear
}: SelectFilterProps) => {
  return (
    <Form.Item
      label={<span css={labelStyles}>{label}</span>}
      css={formItemStyles}
      name={name}
    >
      <Select
        css={inputStyles}
        options={options}
        placeholder={label}
        allowClear
        onSelect={onSelect}
        onClear={onClear}
      />
    </Form.Item>
  );
};

const labelStyles = css`
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.8rem;
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const inputStyles = css`
  width: 14rem !important;
`;
