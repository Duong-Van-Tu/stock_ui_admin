/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { CSSProperties, ReactNode, useEffect, useState } from 'react';
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

  const handleChangeSidebarCollapsed = () => {
    setCollapsed(!collapsed);
    dispatch(setSideBarCollapsed(!collapsed));
  };

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  useEffect(() => {
    if (width <= 1450) {
      dispatch(setSideBarCollapsed(true));
      setCollapsed(true);
    }
  }, [dispatch, width]);

  return (
    <Layout hasSider>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme='light'
        style={sidebarStyle}
        width={250}
        collapsedWidth={80}
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
        <Header collapsed={collapsed} />
        <Content css={contentStyles(colorBgContainer, collapsed)}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

const contentStyles = (background: string, collapsed: boolean) => css`
  background: ${background};
  margin-top: var(--header-height);
  margin-inline-start: ${collapsed
    ? 'var(--collapsed-sidebar-width)'
    : 'var(--expanded-sidebar-width)'};
  transition: margin-inline-start 0.25s ease;
  min-height: calc(100vh - var(--header-height));
  background: var(--white-color);
  padding: 2rem;
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
  scrollbarColor: 'unset'
};

const menuTopStyles = (collapsed: boolean) => css`
  height: var(--header-height);
  border-bottom: 0.1rem solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: ${!collapsed
    ? 'var(--expanded-sidebar-width)'
    : 'var(--collapsed-sidebar-width)'};
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
