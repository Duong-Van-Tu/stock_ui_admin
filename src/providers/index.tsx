'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import { AuthProvider } from './auth.provider';
import { usePathname } from 'next/navigation';
import { getPathnameSegment } from '@/utils/common';
import { antdLocales, Locale } from '@/constants/locale';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import SocketProvider from './socket.provider';

const theme = {
  token: {
    fontFamily: "'Inter', sans-serif"
  }
};

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = getPathnameSegment(pathname, 0) as Locale;

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
