/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Select, SelectProps } from 'antd';
import { FocusEvent } from 'react';

interface FloatSelectProps extends SelectProps<any> {
  label: string;
  width?: string;
}

export default function FloatSelect({
  label,
  value,
  placeholder,
  width = '14rem',
  onFocus,
  onBlur,
  ...restProps
}: FloatSelectProps) {
  // const [focus, setFocus] = useState(true);
  const isOccupied = true;

  const handleWrapperBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      // setFocus(false);
      onBlur?.(e);
    }
  };

  const handleWrapperFocus = (e: FocusEvent<HTMLDivElement>) => {
    // setFocus(true);
    onFocus?.(e);
  };

  return (
    <div
      css={floatLabelWrapper}
      onBlur={handleWrapperBlur}
      onFocus={handleWrapperFocus}
      tabIndex={-1}
    >
      <Select
        {...restProps}
        value={value}
        placeholder=''
        size='middle'
        css={getInputStyles(width)}
      />
      <label
        css={[
          labelBaseStyle(restProps.disabled),
          isOccupied ? labelActiveStyle : labelPlaceholderStyle
        ]}
      >
        {isOccupied ? label : placeholder || label}
      </label>
    </div>
  );
}

const floatLabelWrapper = css`
  position: relative;
  display: inline-block;
`;

const getInputStyles = (width: string) => css`
  width: ${width} !important;
`;

const labelBaseStyle = (hidden?: boolean) => css`
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 1.2rem;
  top: 0.4rem;
  transition: 0.2s ease all;
  background: var(--white-color);
  color: var(--gray-color);
  display: ${hidden && 'none'};
`;

const labelPlaceholderStyle = css`
  color: var(--gray-color);
`;

const labelActiveStyle = css`
  top: -1.2rem;
  font-size: 1.2rem !important;
  padding: 0 0.4rem;
  margin-left: -0.4rem;
`;
