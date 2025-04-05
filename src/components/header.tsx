/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { searchSymbol, watchSearchSymbol } from '@/redux/slices/search';
import { Button, Dropdown, Input, Layout, Space, theme } from 'antd';
import type { MenuProps } from 'antd';
import { Icon } from './icons';
import { MenuItemType } from 'antd/es/menu/interface';
import { logoutUser, watchUser } from '@/redux/slices/auth.slice';
import { PageURLs } from '@/utils/navigate';

enum UserMenu {
  PROFILE,
  LOGOUT
}
const { Search } = Input;

type HeaderProps = {
  collapsed: boolean;
};
export default function Header({ collapsed }: HeaderProps) {
  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const symbol = useAppSelector(watchSearchSymbol);
  const user = useAppSelector(watchUser);
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState('');

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === UserMenu.LOGOUT.toString()) {
      dispatch(logoutUser());
    }
  };

  const handleLanguageChange: MenuProps['onClick'] = (e) => {
    const newSearch = searchParams.toString();
    const newPath =
      pathname.replace(`/${locale}/`, `/${e.key}/`) +
      (newSearch ? `?${newSearch}` : '');
    router.push(newPath);
  };

  const languages: MenuProps['items'] = [
    {
      label: t('english'),
      key: 'en'
    },
    {
      label: t('vietnamese'),
      key: 'vi'
    }
  ];

  const userMenus = {
    items: [
      {
        label: t('profile'),
        key: UserMenu.PROFILE,
        icon: <Icon icon='userProfile' width={16} height={16} />,
        style: { gap: '0.6rem', alignItems: 'flex-start' }
      },
      {
        label: t('logout'),
        key: UserMenu.LOGOUT,
        icon: <Icon icon='logout' width={16} height={16} />,
        style: { gap: '0.6rem' }
      }
    ],
    onClick: handleUserMenuClick,
    style: { minWidth: '14rem', gap: '0.6rem' }
  };

  const handleSearch = (value: string) => {
    const upperCaseValue = value.trim().toUpperCase();
    dispatch(searchSymbol(upperCaseValue));
  };

  const handleClear = () => {
    if (symbol) {
      dispatch(searchSymbol(''));
    }
  };

  useEffect(() => {
    dispatch(searchSymbol(''));
  }, [pathname, dispatch]);

  return (
    <Layout.Header css={rootStyles(colorBgContainer, collapsed)}>
      <div css={leftSectionStyles}>
        <Icon
          onClick={() => router.push(PageURLs.ofIndex())}
          customStyles={logoIconStyles}
          icon='logo'
          width={34}
          height={34}
        />
        <Search
          placeholder={t('searchPlaceholder')}
          size='middle'
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
          onSearch={handleSearch}
          onClear={handleClear}
          css={searchStyles}
        />
      </div>
      <div css={rightSectionStyles}>
        <Dropdown
          menu={{ items: languages, onClick: handleLanguageChange }}
          trigger={['click']}
          arrow
        >
          <Button
            icon={
              <Icon
                icon='language'
                width={18}
                height={18}
                fill='var(--primary-color)'
              />
            }
          >
            <Space>
              <span css={languageStyles}>
                {(
                  languages.find((lang) => lang?.key === locale) as MenuItemType
                )?.label || t('languageLabel')}
              </span>
            </Space>
          </Button>
        </Dropdown>
        <Dropdown.Button
          menu={userMenus}
          placement='bottomRight'
          trigger={['click']}
          icon={<Icon icon='user' width={22} height={22} />}
          arrow
        >
          {user?.fullname}
        </Dropdown.Button>
      </div>
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
  left: ${collapsed
    ? 'var(--collapsed-sidebar-width)'
    : 'var(--expanded-sidebar-width)'};
  transition: left 0.25s ease;
  border-bottom: 0.1rem solid var(--border-color);
  padding-right: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
`;

const leftSectionStyles = css`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const searchStyles = css`
  width: 36rem;
`;

const rightSectionStyles = css`
  display: flex;
  gap: 1rem;
`;

const languageStyles = css`
  display: block;
  color: var(--primary-color);
`;

const logoIconStyles = css`
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
`;
