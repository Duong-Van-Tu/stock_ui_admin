import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './router/app.router';

function App() {
  return (
    <ConfigProvider
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
