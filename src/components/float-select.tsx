/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Select, SelectProps, theme } from 'antd';
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
  const {
    token: { colorBgContainer, colorTextSecondary }
  } = theme.useToken();
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
        placeholder={placeholder || label}
        size='middle'
        css={getInputStyles(width)}
      />
      <label
        css={[
          labelBaseStyle(
            restProps.disabled,
            colorBgContainer,
            colorTextSecondary
          ),
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

const labelBaseStyle = (
  hidden?: boolean,
  backgroundColor?: string,
  textColor?: string
) => css`
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 1.2rem;
  top: 0.4rem;
  transition: 0.2s ease all;
  background: ${backgroundColor || 'var(--white-color)'};
  color: ${textColor || 'var(--text-tertiary-color)'};
  display: ${hidden && 'none'};
`;

const labelPlaceholderStyle = css`
  color: inherit;
`;

const labelActiveStyle = css`
  top: -1.2rem;
  font-size: 1.2rem !important;
  padding: 0 0.4rem;
  margin-left: -0.4rem;
`;
