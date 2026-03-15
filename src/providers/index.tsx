'use client';

import { ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ConfigProvider, theme as antdTheme } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { AuthProvider } from './auth.provider';
import { antdLocales, Locale } from '@/constants/locale.constant';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import SocketProvider from './socket.provider';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import { usePathname } from 'next/navigation';
import { getPathnameSegment } from '@/utils/common';
import ModalProvider from './modal.provider';
import { NotificationProvider } from './notification-provider';
import { ThemeProvider, useThemeMode } from './theme.provider';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppProviders>{children}</AppProviders>
    </ThemeProvider>
  );
}

function AppProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = (getPathnameSegment(pathname, 0) || 'en') as Locale;
  const antdLocale = antdLocales[locale] || enUS;
  const { isDarkMode } = useThemeMode();
  const themeConfig = useMemo(
    () =>
      isDarkMode
        ? {
            algorithm: antdTheme.darkAlgorithm,
            token: {
              fontFamily: "'Inter', sans-serif",
              colorPrimary: '#087ff4'
            }
          }
        : {
            token: {
              fontFamily: "'Inter', sans-serif"
            }
          },
    [isDarkMode]
  );

  return (
    <AntdRegistry>
      <ConfigProvider locale={antdLocale} theme={themeConfig}>
        <Provider store={store}>
          <NotificationProvider>
            <AuthProvider>
              <SocketProvider>
                <ModalProvider>{children}</ModalProvider>
              </SocketProvider>
            </AuthProvider>
          </NotificationProvider>
        </Provider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
