import { useMemo } from 'react';
import { useThemeMode } from '@/providers/theme.provider';

type EChartsThemeTokens = {
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  axisLineColor: string;
  splitLineColor: string;
  tooltipBackgroundColor: string;
  tooltipBorderColor: string;
  tooltipTextColor: string;
  trackColor: string;
};

const getFallbackTokens = (isDarkMode: boolean): EChartsThemeTokens => ({
  backgroundColor: isDarkMode ? '#0f1722' : '#ffffff',
  textColor: isDarkMode ? '#f3f4f6' : '#1a1a1a',
  secondaryTextColor: isDarkMode ? '#c3ceda' : '#595959',
  axisLineColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#cccccc',
  splitLineColor: isDarkMode ? 'rgba(148, 163, 184, 0.14)' : '#e0e0e0',
  tooltipBackgroundColor: isDarkMode ? '#111b2e' : '#ffffff',
  tooltipBorderColor: isDarkMode
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(5, 5, 5, 0.08)',
  tooltipTextColor: isDarkMode ? '#f3f4f6' : '#1a1a1a',
  trackColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)'
});

export const useEChartsTheme = () => {
  const { isDarkMode } = useThemeMode();

  return useMemo(() => getFallbackTokens(isDarkMode), [isDarkMode]);
};
