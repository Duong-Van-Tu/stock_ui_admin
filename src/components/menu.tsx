/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Menu as MenuAnt, MenuProps as MenuPropsAnt } from 'antd';
import { useEffect, useState } from 'react';
import { getPathnameSegment } from '@/utils/common';
import {
  getItem,
  getLevelKeys,
  LevelKeysProps,
  MenuItem,
  getMenuStructure
} from '@/helpers/menus.helper';
import { Icon } from './icons';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type MenuProps = {
  collapsed: boolean;
};
export const Menu = ({ collapsed }: MenuProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [selectedKey, setSelectedKey] = useState<string>(
    getPathnameSegment(pathname, 1)
  );
  const [stateOpenKeys, setStateOpenKeys] = useState(
    collapsed
      ? []
      : [getPathnameSegment(pathname, 1), getPathnameSegment(pathname, 2)]
  );

  const menuStructure = getMenuStructure(t);
  const getMenuIcon = (type: string, itemKey: string) => {
    const isActive = pathname.includes(itemKey);
    const fillColor = isActive ? 'var(--primary-color)' : 'var(--text-color)';

    return (
      <span>
        <Icon icon={type} width={20} height={20} fill={fillColor} />
      </span>
    );
  };

  const createMenuItems = (items: typeof menuStructure): MenuItem[] => {
    return items.map((item) => {
      const labelContent = item.link ? (
        <Link href={item.link}>{item.label}</Link>
      ) : (
        item.label
      );

      let iconContent: React.ReactNode | undefined;
      if (item.iconType) {
        const icon = getMenuIcon(item.iconType, item.key);
        iconContent = item.link ? <Link href={item.link}>{icon}</Link> : icon;
      }

      const children = item.children
        ? createMenuItems(item.children)
        : undefined;

      return getItem(labelContent, item.key, iconContent, children);
    });
  };

  const menuItems: MenuItem[] = createMenuItems(menuStructure);

  const levelKeys = getLevelKeys(menuItems as LevelKeysProps[]);

  const onOpenChange: MenuPropsAnt['onOpenChange'] = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  const handleMenuItemClick = (path: string) => {
    setSelectedKey(path);
  };

  useEffect(() => {
    setSelectedKey(getPathnameSegment(pathname, 1));

    const openKeys = [];
    for (let i = 0; i < 2; i++) {
      const segment = getPathnameSegment(pathname, i + 1);
      if (segment) openKeys.push(segment);
    }

    if (collapsed) {
      setStateOpenKeys([]);
    } else {
      setStateOpenKeys(openKeys);
    }
  }, [pathname, collapsed]);

  return (
    <MenuAnt
      css={rootStyles(collapsed)}
      theme='light'
      mode='inline'
      openKeys={stateOpenKeys}
      selectedKeys={[selectedKey]}
      items={menuItems}
      onSelect={(k) => handleMenuItemClick(k.key)}
      onOpenChange={onOpenChange}
    />
  );
};

const rootStyles = (collapsed: boolean) => css`
  height: 100%;
  .ant-menu-sub.ant-menu-inline > .ant-menu-submenu > .ant-menu-submenu-title,
  .ant-menu-item {
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 2rem;
    .ant-menu-title-content {
      display: ${collapsed ? 'none' : 'block'} !important;
    }
    .ant-menu-item-icon {
      height: ${collapsed ? '100%' : 'unset'};
    }
  }

  .ant-menu-item-selected,
  .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: var(--primary-color) !important;
  }
`;
