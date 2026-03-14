import {
  BellOutlined,
  CloseOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FundOutlined,
  HomeOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  StockOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Input, Layout, Menu, Select, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { ThemeMode } from '../constants/theme.constants';
import { LANGUAGE_CODES } from '../constants/language.constants';
import { THEME_MODES } from '../constants/theme.constants';
import { useAuth } from '../hooks/use-auth.hook';
import { useLanguage } from '../hooks/use-language.hook';
import { useTheme } from '../hooks/use-theme.hook';
import { routePaths } from '../router/router.paths';

const { Sider, Header, Content } = Layout;
const { Text, Title } = Typography;

const navigationItems = [
  { key: routePaths.dashboard.absolute, label: 'Home', icon: <HomeOutlined /> },
  { key: routePaths.stocks.absolute, label: 'Stock Ranking', icon: <TrophyOutlined /> },
  { key: '/stock-alert-logs', label: 'Stock Alert Logs', icon: <BellOutlined /> },
  { key: '/news-scores', label: 'News scores', icon: <FundOutlined /> },
  { key: '/market-psychology', label: 'Market Psychology', icon: <StockOutlined /> },
];

const StyledLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(8, 127, 244, 0.08), transparent 18%),
    linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
`;

const StyledSider = styled(Sider)`
  && {
    background: rgba(255, 255, 255, 0.92);
    border-right: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;

const SidebarHeader = styled.div`
  height: 72px;
  display: grid;
  place-items: center;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
`;

const SidebarToggle = styled.button`
  width: 38px;
  height: 38px;
  border: 1px solid rgba(22, 119, 255, 0.18);
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #1677ff;
  background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    box-shadow: 0 10px 24px rgba(22, 119, 255, 0.14);
    transform: translateY(-1px);
  }
`;

const SidebarMenu = styled(Menu)`
  && {
    border-inline-end: none;
    padding: 16px 10px;
    background: transparent;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  && .ant-menu-item {
    height: 46px;
    margin: 8px 0;
    border-radius: 14px;
    color: rgba(15, 23, 42, 0.88);
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  && .ant-menu-item-selected {
    background: #dff0ff;
    color: #1677ff;
    font-weight: 600;
  }

  && .ant-menu-item .ant-menu-title-content a {
    color: inherit;
  }
`;

const MainShell = styled(Layout)`
  background: transparent;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
`;

const UserDrawer = styled(Drawer)`
  && .ant-drawer-header {
    display: none;
  }

  && .ant-drawer-body {
    padding: 24px;
  }
`;

const Topbar = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  height: auto;
  line-height: normal;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  position: sticky;
  top: 0;
  z-index: 5;
`;

const LeftCluster = styled(Space)`
  && {
    flex: 1;
    min-width: 0;
    gap: 16px;
  }
`;

const RightCluster = styled(Space)`
  && {
    gap: 12px;
    align-items: center;
  }
`;

const SearchWrap = styled.div`
  min-width: 260px;
  max-width: 380px;
  width: 100%;
`;

const MarketBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 14px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(245, 34, 45, 0.12);
  background: rgba(255, 77, 79, 0.05);
`;

const DeltaPill = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: 52px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: linear-gradient(180deg, #ffbf43 0%, #ff9f1c 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
`;

const MarketText = styled(Text)`
  && {
    color: #ef4444;
    max-width: 360px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
  }
`;

const MarketTicker = styled.div`
  display: inline-grid;
  place-items: center;
  min-width: 54px;
  height: 28px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(22, 119, 255, 0.24);
  color: #1677ff;
  font-weight: 700;
  background: #ffffff;
`;

const UserChip = styled(Button)`
  && {
    height: 42px;
    padding-inline: 14px;
    border-radius: 12px;
    border-color: rgba(15, 23, 42, 0.1);
    box-shadow: none;
  }
`;

const Viewport = styled(Content)`
  flex: 1;
  min-height: 0;
  padding: 28px 24px 36px;
  overflow: auto;
`;

const ContentFrame = styled.div`
  min-height: calc(100vh - 104px);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
  padding: 26px;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
`;

const DrawerHeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #1677ff;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  font-size: 18px;
`;

const DrawerMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DrawerTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.92);
`;

const DrawerSubtitle = styled.div`
  font-size: 13px;
  color: rgba(15, 23, 42, 0.55);
`;

const DrawerMenu = styled(Menu)`
  && {
    border-inline-end: none;
    background: transparent;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  &&::after {
    display: none;
  }

  &&.ant-menu-inline,
  &&.ant-menu-vertical {
    border-inline-end: none !important;
  }

  && .ant-menu-item {
    height: 46px;
    margin: 8px 0;
    border-radius: 14px;
    font-size: 15px;
    display: flex;
    align-items: center;
  }
`;

const DrawerFooter = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
`;

const DrawerCloseButton = styled(Button)`
  && {
    border: none;
    box-shadow: none;
    color: rgba(15, 23, 42, 0.62);
  }
`;

const pageTitleByPath: Record<string, string> = {
  [routePaths.dashboard.absolute]: 'Trade Signals Dashboard',
  [routePaths.stocks.absolute]: 'Stock Ranking',
};

const userDrawerItems: MenuProps['items'] = [
  { key: 'settings', icon: <SettingOutlined />, label: 'Setting' },
  { key: 'users', icon: <TeamOutlined />, label: 'Quản lý user' },
  { key: 'payments', icon: <CreditCardOutlined />, label: 'Quản lý thanh toán' },
  { key: 'reports', icon: <FileTextOutlined />, label: 'Báo cáo hệ thống' },
];

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { themeMode, setThemeMode } = useTheme();

  const selectedMenuKey =
    navigationItems.find((item) => item.key === location.pathname)?.key ?? routePaths.dashboard.absolute;

  const menuItems: MenuProps['items'] = navigationItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.key.startsWith('/') && Object.values(routePaths).some((route) => route.absolute === item.key) ? (
      <Link to={item.key}>{item.label}</Link>
    ) : (
      item.label
    ),
  }));

  const handleLogout = () => {
    logout();
    navigate(routePaths.login.absolute, { replace: true });
  };

  const handleLanguageChange = (language: string) => {
    void changeLanguage(language);
  };

  return (
    <StyledLayout>
      <StyledSider
        width={294}
        collapsible
        collapsed={isSidebarCollapsed}
        collapsedWidth={88}
        trigger={null}
      >
        <SidebarHeader>
          <SidebarToggle
            type='button'
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
          >
            {isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </SidebarToggle>
        </SidebarHeader>

        <SidebarMenu
          mode='inline'
          inlineCollapsed={isSidebarCollapsed}
          selectedKeys={[selectedMenuKey]}
          items={menuItems}
        />
      </StyledSider>

      <MainShell>
        <Topbar>
          <LeftCluster size='middle'>
            <SearchWrap>
              <Input
                size='large'
                prefix={<SearchOutlined />}
                placeholder='Search stock'
                allowClear
              />
            </SearchWrap>

            <MarketBadge>
              <DeltaPill>-6.43</DeltaPill>
              <MarketText>
                Adobe agrees to pay $150 million to resolve alleged violations
              </MarketText>
              <MarketTicker>ADBE</MarketTicker>
            </MarketBadge>
          </LeftCluster>

          <RightCluster size='middle'>
            <Select
              value={themeMode}
              style={{ width: 118 }}
              onChange={(value) => setThemeMode(value as ThemeMode)}
              options={[
                { label: 'Light', value: THEME_MODES.light },
                { label: 'Dark', value: THEME_MODES.dark },
              ]}
            />

            <Select
              value={currentLanguage}
              style={{ width: 116 }}
              onChange={(value) => handleLanguageChange(String(value))}
              options={[
                { label: 'VI', value: LANGUAGE_CODES.vi },
                { label: 'EN', value: LANGUAGE_CODES.en },
              ]}
            />

            <UserChip icon={<UserOutlined />} onClick={() => setIsUserDrawerOpen(true)}>
              Kerry
            </UserChip>
          </RightCluster>
        </Topbar>

        <Viewport>
          <ContentFrame>
            <Title level={1} style={{ marginTop: 0, marginBottom: 24, textAlign: 'center' }}>
              {pageTitleByPath[location.pathname] ?? 'Trade Signals Dashboard'}
            </Title>
            <Outlet />
          </ContentFrame>
        </Viewport>
      </MainShell>

      <UserDrawer
        title={null}
        placement='right'
        width={360}
        open={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        closable={false}
      >
        <DrawerHeader>
          <DrawerHeaderMain>
            <UserAvatar>
              <UserOutlined />
            </UserAvatar>
            <DrawerMeta>
              <DrawerTitle>Kerry</DrawerTitle>
              <DrawerSubtitle>Administrator</DrawerSubtitle>
            </DrawerMeta>
          </DrawerHeaderMain>

          <DrawerCloseButton
            type='text'
            aria-label='Close user drawer'
            icon={<CloseOutlined />}
            onClick={() => setIsUserDrawerOpen(false)}
          />
        </DrawerHeader>

        <DrawerMenu mode='inline' selectable={false} items={userDrawerItems} />

        <DrawerFooter>
          <Button block icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </DrawerFooter>
      </UserDrawer>
    </StyledLayout>
  );
}

export default MainLayout;
