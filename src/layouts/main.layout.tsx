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
    radial-gradient(circle at top left, var(--shell-accent-glow), transparent 18%),
    linear-gradient(180deg, var(--shell-gradient-start) 0%, var(--shell-gradient-end) 100%);
`;

const StyledSider = styled(Sider)`
  && {
    background: var(--sidebar-bg);
    position: sticky;
    top: 0;
    height: 100vh;
    backdrop-filter: blur(1.6rem);
    z-index: 2;
    margin-right: -0.1rem;
    overflow: hidden;
  }

  &&::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0.2rem;
    height: 100%;
    background: var(--sidebar-bg);
    pointer-events: none;
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;

const SidebarHeader = styled.div`
  height: 7.2rem;
  display: grid;
  place-items: center;
  border-bottom: 0.1rem solid var(--sidebar-border);
`;

const SidebarToggle = styled.button`
  width: 3.8rem;
  height: 3.8rem;
  border: 0.1rem solid var(--icon-accent-border);
  border-radius: 1.2rem;
  display: grid;
  place-items: center;
  color: var(--icon-accent-color);
  background: linear-gradient(
    180deg,
    var(--icon-accent-bg-start) 0%,
    var(--icon-accent-bg-end) 100%
  );
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    box-shadow: var(--icon-accent-shadow);
    transform: translateY(-0.1rem);
  }
`;

const SidebarMenu = styled(Menu)`
  && {
    border-inline-end: none;
    padding: 1.6rem 1rem;
    background: transparent;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  && .ant-menu-item {
    height: 4.6rem;
    margin: 0.8rem 0;
    border-radius: 1.4rem;
    color: var(--menu-item-color);
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  && .ant-menu-item-selected {
    background: var(--menu-item-selected-bg);
    color: var(--menu-item-selected-color);
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
  position: relative;
`;

const UserDrawer = styled(Drawer)`
  && .ant-drawer-content {
    background: var(--sidebar-bg);
  }

  && .ant-drawer-header {
    display: none;
  }

  && .ant-drawer-body {
    padding: 2.4rem;
    color: var(--text-color);
  }
`;

const Topbar = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding: 0 2.4rem;
  height: 7.2rem;
  line-height: normal;
  background: var(--topbar-bg);
  backdrop-filter: blur(1rem);
  border-bottom: 0.1rem solid var(--topbar-border);
  position: sticky;
  top: 0;
  z-index: 5;
`;

const LeftCluster = styled(Space)`
  && {
    flex: 1;
    min-width: 0;
    gap: 1.6rem;
  }
`;

const CenterCluster = styled.div`
  flex: 0 1 64rem;
  display: flex;
  justify-content: center;
  min-width: 0;
  padding: 0 2rem;
`;

const RightCluster = styled(Space)`
  && {
    flex: 1;
    justify-content: flex-end;
    gap: 1.2rem;
    align-items: center;
  }
`;

const SearchWrap = styled.div`
  min-width: 26rem;
  max-width: 38rem;
  width: 100%;
`;

const MarketBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  width: 100%;
  padding: 0 1.4rem;
  height: 3.8rem;
  border-radius: 1.2rem;
  border: 0.1rem solid var(--market-badge-border);
  background: var(--market-badge-bg);
`;

const DeltaPill = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: 5.2rem;
  height: 2.8rem;
  padding: 0 1rem;
  border-radius: 99.9rem;
  background: linear-gradient(180deg, var(--market-pill-start) 0%, var(--market-pill-end) 100%);
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 700;
`;

const MarketText = styled(Text)`
  && {
    flex: 1;
    min-width: 0;
    color: var(--market-badge-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.4rem;
  }
`;

const MarketTicker = styled.div`
  display: inline-grid;
  place-items: center;
  min-width: 5.4rem;
  height: 2.8rem;
  padding: 0 1.2rem;
  border-radius: 1rem;
  border: 0.1rem solid var(--ticker-border);
  color: var(--ticker-text);
  font-weight: 700;
  background: var(--ticker-bg);
`;

const UserChip = styled(Button)`
  && {
    height: 4.2rem;
    padding-inline: 1.4rem;
    border-radius: 1.2rem;
    border-color: var(--user-chip-border);
    box-shadow: none;
  }
`;

const Viewport = styled(Content)`
  flex: 1;
  min-height: 0;
  padding: 2.8rem 2.4rem 3.6rem;
  overflow: auto;
`;

const ContentFrame = styled.div`
  min-height: calc(100vh - 10.4rem);
  border-radius: 2.6rem;
  background: var(--content-frame-bg);
  border: 0.1rem solid var(--content-frame-border);
  box-shadow: var(--content-frame-shadow);
  backdrop-filter: blur(1.8rem);
  padding: 2.6rem;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  margin-bottom: 2rem;
`;

const DrawerHeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const UserAvatar = styled.div`
  width: 4.4rem;
  height: 4.4rem;
  border-radius: 1.4rem;
  display: grid;
  place-items: center;
  color: var(--icon-accent-color);
  background: linear-gradient(
    180deg,
    var(--icon-accent-bg-start) 0%,
    var(--icon-accent-bg-end) 100%
  );
  font-size: 1.8rem;
`;

const DrawerMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const DrawerTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-color);
`;

const DrawerSubtitle = styled.div`
  font-size: 1.3rem;
  color: var(--drawer-subtitle);
`;

const DrawerMenu = styled(Menu)`
  && {
    border-inline-end: none;
    background: transparent;
    margin-top: 1.6rem;
    padding-top: 1.6rem;
    border-top: 0.1rem solid var(--drawer-divider);
  }

  &&::after {
    display: none;
  }

  &&.ant-menu-inline,
  &&.ant-menu-vertical {
    border-inline-end: none !important;
  }

  && .ant-menu-item {
    height: 4.6rem;
    margin: 0.8rem 0;
    border-radius: 1.4rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    color: var(--menu-item-color);
  }
`;

const DrawerFooter = styled.div`
  margin-top: 2rem;
  padding-top: 1.6rem;
  border-top: 0.1rem solid var(--drawer-divider);
`;

const DrawerCloseButton = styled(Button)`
  && {
    border: none;
    box-shadow: none;
    color: var(--close-button-color);
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
    navigationItems.find((item) => item.key === location.pathname)?.key ??
    routePaths.dashboard.absolute;

  const menuItems: MenuProps['items'] = navigationItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label:
      item.key.startsWith('/') &&
      Object.values(routePaths).some((route) => route.absolute === item.key) ? (
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
        width='29.4rem'
        collapsible
        collapsed={isSidebarCollapsed}
        collapsedWidth='8.8rem'
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
          </LeftCluster>

          <CenterCluster>
            <MarketBadge>
              <DeltaPill>-6.43</DeltaPill>
              <MarketText>
                Adobe agrees to pay $150 million to resolve alleged violations
              </MarketText>
              <MarketTicker>ADBE</MarketTicker>
            </MarketBadge>
          </CenterCluster>

          <RightCluster size='middle'>
            <Select
              value={themeMode}
              style={{ width: '11.8rem' }}
              onChange={(value) => setThemeMode(value as ThemeMode)}
              options={[
                { label: 'Light', value: THEME_MODES.light },
                { label: 'Dark', value: THEME_MODES.dark },
              ]}
            />

            <Select
              value={currentLanguage}
              style={{ width: '11.6rem' }}
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
            <Title level={1} style={{ marginTop: 0, marginBottom: '2.4rem', textAlign: 'center' }}>
              {pageTitleByPath[location.pathname] ?? 'Trade Signals Dashboard'}
            </Title>
            <Outlet />
          </ContentFrame>
        </Viewport>
      </MainShell>

      <UserDrawer
        title={null}
        placement='right'
        width='36rem'
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
