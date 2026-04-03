/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import { Icon } from './icons';

export default function AuthSplashScreen() {
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

const brandShimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 220% 50%;
  }
`;

const brandGlow = keyframes`
  0% {
    transform: translateY(0);
    filter: drop-shadow(0 0.5rem 1.2rem rgba(183, 134, 42, 0.16));
  }
  100% {
    transform: translateY(-0.2rem);
    filter: drop-shadow(0 0.8rem 1.8rem rgba(242, 217, 119, 0.32));
  }
`;

const brandUnderline = keyframes`
  0% {
    width: 34%;
    opacity: 0.48;
  }
  100% {
    width: 48%;
    opacity: 0.86;
  }
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
    #f6e08d 36%,
    #c99535 52%,
    #8c5b1e 72%,
    #f2d977 100%
  );
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0.5rem 1.2rem rgba(183, 134, 42, 0.22));
  animation:
    ${brandShimmer} 5.2s linear infinite,
    ${brandGlow} 2.8s ease-in-out infinite alternate;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -0.8rem;
    width: 42%;
    height: 0.3rem;
    border-radius: 999px;
    transform: translateX(-50%);
    background: linear-gradient(
      90deg,
      rgba(184, 134, 42, 0),
      #e9c86a,
      rgba(184, 134, 42, 0)
    );
    opacity: 0.75;
    animation: ${brandUnderline} 2.8s ease-in-out infinite alternate;
  }
`;
