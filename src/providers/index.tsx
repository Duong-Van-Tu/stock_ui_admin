'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { AuthProvider } from './auth.provider';
import { antdLocales, Locale } from '@/constants/locale';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import SocketProvider from './socket.provider';
import { useLocale } from 'next-intl';
import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const theme = {
  token: {
    fontFamily: "'Inter', sans-serif"
  }
};

export default function Providers({ children }: { children: ReactNode }) {
  const locale = (useLocale() || 'en') as Locale;

  const antdLocale = antdLocales[locale] || enUS;

  return (
    <AntdRegistry>
      <ConfigProvider locale={antdLocale} theme={theme}>
        <Provider store={store}>
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </Provider>
      </ConfigProvider>
    </AntdRegistry>
  );
}
