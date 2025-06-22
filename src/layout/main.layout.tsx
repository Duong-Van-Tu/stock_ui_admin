/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Button, Layout, theme } from 'antd';
import { Icon } from '@/components/icons';
import { Menu } from '@/components/menu';
import Header from '@/components/header';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setSideBarCollapsed,
  watchSideBarCollapsed
} from '@/redux/slices/app.slice';
import { useWindowSize } from '@/hooks/window-size.hook';

const { Content, Sider } = Layout;

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const dispatch = useAppDispatch();
  const { width } = useWindowSize();
  const sideBarCollapsed = useAppSelector(watchSideBarCollapsed);
  const [collapsed, setCollapsed] = useState(sideBarCollapsed);
  const [isClient, setIsClient] = useState(false);

  const handleChangeSidebarCollapsed = () => {
    setCollapsed(!collapsed);
    dispatch(setSideBarCollapsed(!collapsed));
  };

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  useEffect(() => {
    if (isMobile) {
      dispatch(setSideBarCollapsed(true));
      setCollapsed(true);
    }
  }, [dispatch, width]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Layout hasSider css={rootStyles}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme='light'
        style={sidebarStyle}
        width={isMobile ? '100%' : 250}
        collapsedWidth={isMobile ? 50 : 80}
      >
        <div css={menuTopStyles(collapsed)}>
          <Button
            css={collapsedBtnStyles}
            type='text'
            icon={
              collapsed ? (
                <Icon
                  icon='expandLeft'
                  width={24}
                  height={24}
                  fill='var(--primary-color)'
                />
              ) : (
                <Icon
                  icon='expandRight'
                  width={24}
                  height={24}
                  fill='var(--primary-color)'
                />
              )
            }
            onClick={handleChangeSidebarCollapsed}
          />
        </div>
        <div css={menuContainerStyle}>
          <Menu collapsed={collapsed} />
        </div>
      </Sider>
      <Layout css={layoutStyles}>
        {!(isMobile && !collapsed) && <Header collapsed={collapsed} />}
        <Content css={contentStyles(colorBgContainer, collapsed)}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

const rootStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
`;

const contentStyles = (background: string, collapsed: boolean) => css`
  background: ${background};
  margin-top: var(--header-height);
  margin-inline-start: ${isMobile
    ? collapsed
      ? 'var(--mobile-collapsed-sidebar-width)'
      : 'var(--mobile-expanded-sidebar-width)'
    : collapsed
    ? 'var(--collapsed-sidebar-width)'
    : 'var(--expanded-sidebar-width)'};
  transition: margin-inline-start 0.25s ease;
  min-height: calc(100vh - var(--header-height));
  background: var(--white-color);
  padding: ${isMobile ? '2rem 1rem' : '2rem'};
`;

const layoutStyles = css`
  background: var(--white-color);
  height: '100%';
`;

const sidebarStyle: CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarColor: 'unset',
  zIndex: 99
};

const menuTopStyles = (collapsed: boolean) => css`
  height: var(--header-height);
  border-bottom: 0.1rem solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: ${isMobile
    ? collapsed
      ? 'var(--mobile-collapsed-sidebar-width)'
      : 'var(--mobile-expanded-sidebar-width)'
    : collapsed
    ? 'var(--collapsed-sidebar-width)'
    : 'var(--expanded-sidebar-width)'};

  background: var(--white-color);
  z-index: 99;
  transition: width 0.25s ease;
  border-right: 0.1rem solid var(--border-color);
`;

const menuContainerStyle = css`
  margin-top: var(--header-height);
  height: calc(100% - var(--header-height));
`;

const collapsedBtnStyles = css`
  font-size: 1.6rem;
  width: 2.4rem;
  height: 2.4rem;
  &:hover {
    background: none !important;
    opacity: 0.85;
  }
`;
