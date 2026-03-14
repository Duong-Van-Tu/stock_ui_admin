import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { RouterProvider } from 'react-router-dom';
import { LANGUAGE_CODES } from './constants/language.constants';
import { appThemeTokens, THEME_MODES } from './constants/theme.constants';
import { useLanguage } from './hooks/use-language.hook';
import { useTheme } from './hooks/use-theme.hook';
import { appRouter } from './router/app.router';

function App() {
  const { currentLanguage } = useLanguage();
  const { themeMode } = useTheme();
  const antdLocale = currentLanguage === LANGUAGE_CODES.en ? enUS : viVN;
  const currentThemeTokens = appThemeTokens[themeMode];

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        algorithm: themeMode === THEME_MODES.dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentThemeTokens.colorPrimary,
          colorBgBase: currentThemeTokens.colorBgBase,
          colorBgContainer: currentThemeTokens.colorBgContainer,
          colorText: currentThemeTokens.colorText,
          colorTextSecondary: currentThemeTokens.colorTextSecondary,
          colorBorder: currentThemeTokens.colorBorder,
          colorSuccess: currentThemeTokens.colorSuccess,
          colorWarning: currentThemeTokens.colorWarning,
          colorError: currentThemeTokens.colorError,
          borderRadius: 4,
        },
        components: {
          Layout: {
            headerBg: currentThemeTokens.layoutHeaderBg,
            bodyBg: currentThemeTokens.layoutBodyBg,
          },
        },
      }}
    >
      <RouterProvider router={appRouter} />
    </ConfigProvider>
  );
}

export default App;
