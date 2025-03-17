/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Layout, theme } from 'antd';

type HeaderProps = {
  collapsed: boolean;
};
export default function Header({ collapsed }: HeaderProps) {
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  return (
    <Layout.Header css={rootStyles(colorBgContainer, collapsed)}>
      Header
    </Layout.Header>
  );
}

const rootStyles = (background: string, collapsed: boolean) => css`
  background: ${background};
  padding: 0;
  height: var(--header-height);
  position: fixed;
  right: 0;
  z-index: 99;
  min-width: 110rem;
  left: ${collapsed
    ? 'var(--collapsed-sidebar-width)'
    : 'var(--expanded-sidebar-width)'};
  transition: left 0.25s ease;
  border-bottom: 0.1rem solid var(--border-color);
  padding-right: 2rem;
`;
