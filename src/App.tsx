import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { RouterProvider } from 'react-router-dom';
import { LANGUAGE_CODES } from './constants/language.constants';
import { useLanguage } from './hooks/use-language.hook';
import { appRouter } from './router/app.router';

function App() {
  const { currentLanguage } = useLanguage();
  const antdLocale = currentLanguage === LANGUAGE_CODES.en ? enUS : viVN;

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#00b96b',
          borderRadius: 4,
        },
      }}
    >
      <RouterProvider router={appRouter} />
    </ConfigProvider>
  );
}

export default App;
