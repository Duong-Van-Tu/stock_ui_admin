import { Button, Layout, Menu, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth.hook';
import { routePaths } from '../router/router.paths';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const menuItems: MenuProps['items'] = [
  {
    key: routePaths.dashboard.absolute,
    label: <Link to={routePaths.dashboard.absolute}>Dashboard</Link>,
  },
  {
    key: routePaths.stocks.absolute,
    label: <Link to={routePaths.stocks.absolute}>Stocks</Link>,
  },
];

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(routePaths.login.absolute, { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
          paddingInline: 24,
        }}
      >
        <div>
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            Stock Admin
          </Title>
          <Text style={{ color: '#cbd5e1' }}>Quan ly thong tin co phieu</Text>
        </div>

        <Space size='middle' style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Menu
            theme='dark'
            mode='horizontal'
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end', background: 'transparent' }}
          />
          <Button onClick={handleLogout}>Dang xuat</Button>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default MainLayout;
