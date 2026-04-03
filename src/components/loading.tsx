/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Icon } from './icons';

export default function Loading() {
  return (
    <div css={rootStyles}>
      <div css={contentStyles}>
        <Icon icon='logo' width={96} height={96} customStyles={logoStyles} />
        <div css={textBlockStyles}>
          <div css={appNameStyles}>Daily Option Profit</div>
        </div>
      </div>
    </div>
  );
}

const rootStyles = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 50% 38%,
      rgba(8, 127, 244, 0.04),
      transparent 24%
    ),
    linear-gradient(180deg, rgba(7, 27, 48, 0.02), rgba(7, 27, 48, 0.008)),
    var(--app-background-color);
  z-index: 999;

  html[data-theme='dark'] & {
    background:
      radial-gradient(
        circle at 50% 38%,
        rgba(8, 127, 244, 0.08),
        transparent 24%
      ),
      linear-gradient(180deg, rgba(7, 27, 48, 0.04), rgba(7, 27, 48, 0.015)),
      var(--app-background-color);
  }
`;

const contentStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.8rem;
  padding: 2.4rem;
  text-align: center;
`;

const logoStyles = css`
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 10px 24px rgba(7, 27, 48, 0.12));

  html[data-theme='dark'] & {
    filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.28));
  }
`;

const textBlockStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

const appNameStyles = css`
  font-family: var(--font-family);
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0.04rem;
  color: #12263f;

  html[data-theme='dark'] & {
    color: rgba(255, 255, 255, 0.92);
  }
`;
