/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Icon } from './icons';

export default function AuthSplashScreen() {
  return (
    <div css={rootStyles}>
      <div css={contentStyles}>
        <Icon icon='logo' width={108} height={108} customStyles={logoStyles} />
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
      circle at 50% 34%,
      rgba(202, 171, 87, 0.04),
      transparent 22%
    ),
    radial-gradient(
      circle at 50% 62%,
      rgba(126, 162, 199, 0.035),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      rgba(242, 239, 232, 0.82),
      rgba(236, 240, 245, 0.8)
    ),
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
  gap: 1.4rem;
  padding: 2.4rem;
  text-align: center;
`;

const logoStyles = css`
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 7px 16px rgba(7, 27, 48, 0.07));

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
  position: relative;
  display: inline-block;
  font-family: var(--font-family);
  font-size: clamp(2.8rem, 4vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.05rem;
  background: linear-gradient(
    115deg,
    #6d4615 0%,
    #b8862a 18%,
    #d7af51 36%,
    #c99535 52%,
    #8c5b1e 72%,
    #cea447 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0.16rem 0.5rem rgba(183, 134, 42, 0.08));
`;
