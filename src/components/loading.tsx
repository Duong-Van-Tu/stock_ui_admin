/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { Icon } from './icons';

export default function Loading() {
  return (
    <div css={rootStyles}>
      <div css={loaderStyles}>
        <div css={circleStyles}></div>
        <Icon type='logo' width={70} height={70} customStyles={logoStyles} />
      </div>
    </div>
  );
}

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const rootStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--loading-background-color);
`;

const loaderStyles = css`
  position: relative;
  width: 10rem;
  height: 10rem;
  overflow: hidden;
`;

const circleStyles = css`
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(
    to right,
    var(--loading-color) 10%,
    rgba(0, 100, 166, 0) 50%
  );
  animation: ${spinAnimation} 1s infinite linear;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 92%;
    height: 92%;
    margin: auto;
    border-radius: 50%;
    background: var(--loading-background-color);
  }
`;

const logoStyles = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
