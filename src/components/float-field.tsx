/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { theme } from 'antd';

type FloatFieldProps = {
  label: string;
  width: string;
  children: ReactNode;
};

export default function FloatField({
  label,
  width,
  children
}: FloatFieldProps) {
  const {
    token: { colorBgContainer, colorTextSecondary }
  } = theme.useToken();

  return (
    <div css={floatFieldWrapperStyles(width)}>
      <label css={floatFieldLabelStyles(colorBgContainer, colorTextSecondary)}>
        {label}
      </label>
      {children}
    </div>
  );
}

const floatFieldWrapperStyles = (width: string) => css`
  position: relative;
  display: inline-block;
  width: ${width};
  padding-top: 0.8rem;
`;

const floatFieldLabelStyles = (
  backgroundColor: string,
  textColor: string
) => css`
  position: absolute;
  top: -0.2rem;
  left: 1.2rem;
  z-index: 1;
  padding: 0 0.4rem;
  margin-left: -0.4rem;
  background: ${backgroundColor};
  color: ${textColor};
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.6rem;
  pointer-events: none;
`;
