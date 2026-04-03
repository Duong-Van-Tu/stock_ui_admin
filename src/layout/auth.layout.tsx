'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { Icon } from '@/components/icons';
import ThemeToggle from '@/components/theme-toggle';
import { useThemeMode } from '@/providers/theme.provider';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PageURLs } from '@/utils/navigate';

const { Title, Text } = Typography;

type AuthLayoutProps = {
  description: string;
  mode: 'login' | 'register';
  children: React.ReactNode;
};

const featureKeys = [
  {
    title: 'authFeatureRealtimeTitle',
    description: 'authFeatureRealtimeDescription'
  },
  {
    title: 'authFeatureWatchlistTitle',
    description: 'authFeatureWatchlistDescription'
  },
  {
    title: 'authFeatureInsightsTitle',
    description: 'authFeatureInsightsDescription'
  }
] as const;

export default function AuthLayout({
  description,
  mode,
  children
}: AuthLayoutProps) {
  const { isDarkMode } = useThemeMode();
  const t = useTranslations();

  return (
    <div css={rootStyle(isDarkMode)}>
      <div css={shellStyles(isDarkMode)}>
        <section css={showcaseStyles(isDarkMode)}>
          <div css={brandRowStyles}>
            <div css={brandIconWrapStyles(isDarkMode)}>
              <Icon icon='logo' width={42} height={42} />
            </div>
            <div css={brandTextWrapStyles}>
              <Text css={brandTitleStyles}>{t('appTitle')}</Text>
              <Text css={brandDescriptionStyles}>{t('appDescription')}</Text>
            </div>
          </div>

          <div css={showcaseHeaderStyles}>
            <span css={eyebrowStyles(isDarkMode)}>{t('authEyebrow')}</span>
            <Title level={1} css={showcaseTitleStyles}>
              {t('authPanelTitle')}
            </Title>
            <Text css={showcaseDescriptionStyles}>
              {t('authPanelDescription')}
            </Text>
          </div>

          <div css={featureGridStyles}>
            {featureKeys.map((feature, index) => (
              <div key={feature.title} css={featureCardStyles(isDarkMode)}>
                <span css={featureIndexStyles}>{`0${index + 1}`}</span>
                <Title level={4} css={featureTitleStyles}>
                  {t(feature.title)}
                </Title>
                <Text css={featureDescriptionStyles}>
                  {t(feature.description)}
                </Text>
              </div>
            ))}
          </div>
        </section>

        <section css={cardStyles(isDarkMode)}>
          <div css={cardBodyStyles}>
            <div css={cardTopBarStyles}>
              <div css={cardBadgeStyles(isDarkMode)}>
                <Icon icon='logo' width={18} height={18} />
                <span>{t('authEyebrow')}</span>
              </div>
              <div css={toggleWrapStyles}>
                <ThemeToggle compact />
              </div>
            </div>

            <div css={cardHeaderStyles}>
              <div css={segmentedWrapStyles(isDarkMode)}>
                <Link
                  href={PageURLs.ofLogin()}
                  scroll={false}
                  css={segmentItemStyles(isDarkMode, mode === 'login')}
                >
                  {t('login')}
                </Link>
                <Link
                  href={PageURLs.ofRegister()}
                  scroll={false}
                  css={segmentItemStyles(isDarkMode, mode === 'register')}
                >
                  {t('register')}
                </Link>
              </div>
              <Text css={cardDescriptionStyles}>{description}</Text>
            </div>

            <div css={contentStyles}>{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

const rootStyle = (isDarkMode: boolean) => css`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  padding: clamp(0.8rem, 1.8vw, 2rem);
  overflow: hidden;
  background:
    radial-gradient(
      circle at top left,
      ${isDarkMode ? 'rgba(17, 120, 255, 0.24)' : 'rgba(8, 127, 244, 0.18)'} 0%,
      transparent 30%
    ),
    radial-gradient(
      circle at bottom right,
      ${isDarkMode ? 'rgba(18, 200, 245, 0.18)' : 'rgba(9, 190, 255, 0.14)'} 0%,
      transparent 28%
    ),
    linear-gradient(
      135deg,
      ${isDarkMode ? '#07111f' : '#eef6ff'} 0%,
      ${isDarkMode ? '#0b1627' : '#f8fbff'} 52%,
      ${isDarkMode ? '#0f1722' : '#fdfefe'} 100%
    );

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(
        rgba(255, 255, 255, ${isDarkMode ? '0.05' : '0.3'}) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255, 255, 255, ${isDarkMode ? '0.05' : '0.3'}) 1px,
        transparent 1px
      );
    background-size: 7.2rem 7.2rem;
    mask-image: radial-gradient(circle at center, black 35%, transparent 82%);
    pointer-events: none;
  }

  @media (max-width: 767px) {
    align-items: flex-start;
    padding: 0.8rem;
  }
`;

const shellStyles = (isDarkMode: boolean) => css`
  position: relative;
  z-index: 1;
  display: grid;
  align-items: stretch;
  grid-template-columns: minmax(0, 1.14fr) minmax(34rem, 0.86fr);
  width: min(104rem, 100%);
  padding: clamp(0.8rem, 1.2vw, 1.2rem);
  gap: clamp(0.8rem, 1.2vw, 1.2rem);
  border-radius: 3.2rem;
  border: 1px solid
    ${isDarkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(255, 255, 255, 0.7)'};
  background: ${isDarkMode
    ? 'rgba(8, 15, 27, 0.7)'
    : 'rgba(255, 255, 255, 0.7)'};
  box-shadow: 0 3.2rem 8rem
    ${isDarkMode ? 'rgba(0, 0, 0, 0.26)' : 'rgba(15, 23, 42, 0.14)'};
  backdrop-filter: blur(2.4rem);

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
    max-width: 48rem;
  }

  @media (max-height: 860px) and (min-width: 1024px) {
    width: min(100rem, 100%);
  }

  @media (max-width: 767px) {
    padding: 0.6rem;
    gap: 0.6rem;
    border-radius: 2rem;
  }
`;

const showcaseStyles = (isDarkMode: boolean) => css`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  min-height: clamp(49rem, 64dvh, 63rem);
  padding: clamp(2.6rem, 3vw, 3.6rem);
  border-radius: 2.4rem;
  background:
    radial-gradient(
      circle at top right,
      ${isDarkMode ? 'rgba(33, 200, 246, 0.22)' : 'rgba(33, 200, 246, 0.18)'} 0%,
      transparent 34%
    ),
    linear-gradient(
      160deg,
      ${isDarkMode ? 'rgba(10, 23, 40, 0.96)' : 'rgba(8, 127, 244, 0.98)'} 0%,
      ${isDarkMode ? 'rgba(15, 38, 67, 0.96)' : 'rgba(15, 98, 214, 0.96)'} 100%
    );
  color: var(--white-color);

  &::after {
    content: '';
    position: absolute;
    right: -8rem;
    bottom: -8rem;
    width: 24rem;
    height: 24rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.09);
    filter: blur(0.4rem);
  }

  @media (max-width: 767px) {
    padding: 2.4rem;
    border-radius: 2rem;
  }

  @media (max-height: 860px) and (min-width: 1024px) {
    min-height: clamp(46rem, 60dvh, 56rem);
  }

  @media (max-width: 1023px) {
    display: none;
  }
`;

const brandRowStyles = css`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 1.4rem;
`;

const brandIconWrapStyles = (isDarkMode: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 1.8rem;
  background: ${isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.14)'};
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(1.2rem);
`;

const brandTextWrapStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const brandTitleStyles = css`
  color: var(--white-color) !important;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
`;

const brandDescriptionStyles = css`
  color: rgba(255, 255, 255, 0.72) !important;
  font-size: 1.4rem;
  line-height: 1.6;
`;

const showcaseHeaderStyles = css`
  position: relative;
  z-index: 1;
  margin-top: clamp(2.4rem, 4vw, 4.8rem);
  max-width: 52rem;

  @media (max-width: 767px) {
    margin-top: 3.2rem;
  }
`;

const eyebrowStyles = (isDarkMode: boolean) => css`
  display: inline-flex;
  align-items: center;
  min-height: 3.6rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(255, 255, 255, 0.12)'};
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const showcaseTitleStyles = css`
  margin-top: 1.6rem !important;
  margin-bottom: 1.2rem !important;
  color: var(--white-color) !important;
  font-size: clamp(3rem, 4.2vw, 5rem) !important;
  line-height: 1.05 !important;
  letter-spacing: -0.04em;
`;

const showcaseDescriptionStyles = css`
  display: block;
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 1.6rem;
  line-height: 1.65;
`;

const featureGridStyles = css`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: clamp(2.4rem, 3vw, 4.2rem);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    margin-top: 3.2rem;
  }
`;

const featureCardStyles = (isDarkMode: boolean) => css`
  position: relative;
  min-height: 15rem;
  padding: 1.2rem 1rem;
  border-radius: 2rem;
  background: ${isDarkMode
    ? 'rgba(255, 255, 255, 0.07)'
    : 'rgba(255, 255, 255, 0.12)'};
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(1.2rem);
`;

const featureIndexStyles = css`
  display: inline-flex;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.1em;
`;

const featureTitleStyles = css`
  margin-top: 1.8rem !important;
  margin-bottom: 0.8rem !important;
  color: var(--white-color) !important;
  font-size: 1.8rem !important;
  line-height: 1.25 !important;
`;

const featureDescriptionStyles = css`
  display: block;
  color: rgba(255, 255, 255, 0.72) !important;
  font-size: 1.4rem;
  line-height: 1.6;
`;

const cardStyles = (isDarkMode: boolean) => css`
  position: relative;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  min-height: clamp(48rem, 58dvh, 60rem);
  padding: clamp(2rem, 2.4vw, 2.6rem) clamp(2rem, 2.6vw, 2.8rem);
  border-radius: 2.4rem;
  background: ${isDarkMode
    ? 'rgba(17, 27, 46, 0.9)'
    : 'rgba(255, 255, 255, 0.92)'};
  border: 1px solid
    ${isDarkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(8, 127, 244, 0.08)'};
  box-shadow: inset 0 0 0 1px
    ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.4)'};
  backdrop-filter: blur(1.2rem);

  @media (max-width: 1023px) {
    min-height: auto;
  }

  @media (max-height: 860px) and (min-width: 1024px) {
    min-height: clamp(46rem, 56dvh, 54rem);
  }

  @media (max-width: 767px) {
    padding: 2rem 1.6rem 1.8rem;
    border-radius: 2rem;
  }
`;

const cardTopBarStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  width: 100%;
  margin-bottom: 2rem;
`;

const toggleWrapStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`;

const cardBodyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: min(100%, 37.6rem);
  margin: 0 auto;
  padding-top: 0.2rem;
  min-height: 100%;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const cardHeaderStyles = css`
  width: 100%;
  flex: 0 0 auto;
`;

const segmentedWrapStyles = (isDarkMode: boolean) => css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  padding: 0.5rem;
  margin-bottom: 1.2rem;
  border-radius: 999px;
  border: 1px solid
    ${isDarkMode ? 'rgba(148, 163, 184, 0.16)' : 'rgba(8, 127, 244, 0.1)'};
  background: ${isDarkMode
    ? 'rgba(148, 163, 184, 0.08)'
    : 'rgba(8, 127, 244, 0.05)'};
`;

const segmentItemStyles = (isDarkMode: boolean, isActive: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 4.4rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  color: ${isActive
    ? 'var(--white-color)'
    : isDarkMode
      ? 'var(--text-secondary-color)'
      : 'color-mix(in srgb, var(--text-primary-strong-color) 82%, white)'};
  background: ${isActive
    ? 'linear-gradient(135deg, #0f7bff 0%, #20c3f2 100%)'
    : 'transparent'};
  box-shadow: ${isActive ? '0 1.2rem 2.6rem rgba(8, 127, 244, 0.22)' : 'none'};
  font-size: 1.45rem;
  font-weight: 700;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: ${isActive ? 'var(--white-color)' : 'var(--primary-color)'};
    background: ${isActive
      ? 'linear-gradient(135deg, #0f7bff 0%, #20c3f2 100%)'
      : 'rgba(8, 127, 244, 0.06)'};
    transform: translateY(-1px);
  }
`;

const cardBadgeStyles = (isDarkMode: boolean) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 3.4rem;
  padding: 0 1.2rem;
  border-radius: 999px;
  border: 1px solid
    ${isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(8, 127, 244, 0.12)'};
  background: ${isDarkMode
    ? 'rgba(148, 163, 184, 0.08)'
    : 'rgba(8, 127, 244, 0.06)'};
  color: var(--text-secondary-color);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const cardDescriptionStyles = css`
  display: block;
  color: color-mix(
    in srgb,
    var(--text-secondary-color) 86%,
    var(--text-primary-strong-color)
  ) !important;
  font-size: 1.5rem;
  line-height: 1.6;
`;

const contentStyles = css`
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-top: 2rem;

  > * {
    width: 100%;
  }

  @media (max-width: 767px) {
    margin-top: 1.6rem;
  }
`;
