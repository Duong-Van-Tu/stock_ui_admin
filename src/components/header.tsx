/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { searchSymbol } from '@/redux/slices/search';
import { Button, Dropdown, Layout, Space } from 'antd';
import type { MenuProps } from 'antd';
import { Icon } from './icons';
import { MenuItemType } from 'antd/es/menu/interface';
import { logoutUser, watchUser } from '@/redux/slices/auth.slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { PageURLs } from '@/utils/navigate';
import { getPathnameSegment } from '@/utils/common';
import { setSideBarCollapsed } from '@/redux/slices/app.slice';
import { regex } from '@/utils/regex';
import BreakingNews from './breaking-news';
import { EconomicCalendarList } from './economic-calendar-list';
import { useWindowSize } from '@/hooks/window-size.hook';
import ThemeToggle from './theme-toggle';
import { SearchOutlined } from '@ant-design/icons';
import TimeZoneClock from './time-zone-clock';

enum UserMenu {
  PROFILE,
  LOGOUT
}

type HeaderProps = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getPathnameSegment(pathname, 0) || 'en';
  const user = useAppSelector(watchUser);
  const searchParams = useSearchParams();
  const { width, isMobile, isDesktop } = useWindowSize();
  const showBreakingNews = width >= 1280;
  const showUserFullName = width >= 1080;
  const showTimeZoneClock = !isMobile;

  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const urlSymbol = searchParams.get('symbol')?.toUpperCase() || '';
    setSearchValue(urlSymbol);
  }, [searchParams]);

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === UserMenu.LOGOUT.toString()) {
      dispatch(logoutUser());
      if (pathname !== PageURLs.ofIndex()) {
        const currentUrl =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      }
    }
  };

  const handleToggleMenu = () => {
    setCollapsed(!collapsed);
    dispatch(setSideBarCollapsed(!collapsed));
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
      label: 'English',
      key: 'en'
    },
    {
      label: 'Tiếng việt',
      key: 'vi',
      disabled: true
    }
  ];

  const userMenus = {
    items: [
      {
        label: t('profile'),
        key: UserMenu.PROFILE,
        icon: (
          <Icon icon='userProfile' width={16} height={16} fill='currentColor' />
        ),
        style: { gap: '0.6rem', alignItems: 'flex-start' }
      },
      {
        label: t('logout'),
        key: UserMenu.LOGOUT,
        icon: <Icon icon='logout' width={16} height={16} fill='currentColor' />,
        style: { gap: '0.6rem' }
      }
    ],
    onClick: handleUserMenuClick,
    style: { minWidth: '14rem', gap: '0.6rem' }
  };

  const handleSearch = (value: string) => {
    const upperCaseValue = value.trim().toUpperCase();
    const params = new URLSearchParams(searchParams);

    if (!upperCaseValue) {
      params.delete('symbol');
      router.push(`${pathname}?${params.toString()}`);
      setSearchValue('');
      return;
    }

    params.set('symbol', upperCaseValue);
    router.push(`${pathname}?${params.toString()}`);

    if (
      regex.stockDetailPath.test(pathname) ||
      regex.watchlistSwingTradeHistoryPath.test(pathname)
    ) {
      dispatch(searchSymbol(upperCaseValue));
    }
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('symbol');
    router.push(`${pathname}?${params.toString()}`);
    setSearchValue('');
  };

  useEffect(() => {
    dispatch(searchSymbol(''));
  }, [pathname, dispatch]);

  return (
    <Layout.Header css={rootStyles(collapsed, isMobile)}>
      <div css={leftSectionStyles(isMobile)}>
        {isMobile && (
          <Icon
            customStyles={menuIconStyles}
            icon='menu'
            width={32}
            height={32}
            onClick={handleToggleMenu}
          />
        )}

        <Icon
          onClick={() => router.push(PageURLs.ofIndex())}
          customStyles={logoIconStyles}
          icon='logo'
          width={34}
          height={34}
        />
        <div css={searchWrapperStyles(isDesktop)}>
          <input
            type='text'
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
            css={searchInputStyles}
          />
          {!!searchValue && (
            <button
              type='button'
              aria-label='Clear search'
              onClick={handleClear}
              css={searchClearBtnStyles}
            >
              ×
            </button>
          )}
          <Button
            type='text'
            css={searchActionBtnStyles}
            icon={<SearchOutlined css={searchActionIconStyles} />}
            onClick={() => handleSearch(searchValue)}
          />
        </div>
      </div>
      {showBreakingNews && (
        <div css={breakingNewsStyles(isMobile)}>
          <BreakingNews />
        </div>
      )}
      <div css={rightSectionStyles(isMobile)}>
        <EconomicCalendarList />
        {showTimeZoneClock && <TimeZoneClock />}
        <ThemeToggle compact={isMobile} />
        {isDesktop && (
          <div
            css={css`
              display: none;
            `}
          >
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
                      languages.find(
                        (lang) => lang?.key === locale
                      ) as MenuItemType
                    )?.label || t('languageLabel')}
                  </span>
                </Space>
              </Button>
            </Dropdown>
          </div>
        )}
        <Dropdown
          menu={userMenus}
          placement='bottomRight'
          trigger={['click']}
          arrow
        >
          <button type='button' css={userDropdownBtnStyles(showUserFullName)}>
            {showUserFullName && (
              <span css={userNameStyles}>{user?.fullname}</span>
            )}
            <span css={userAvatarChipStyles(isMobile)}>
              <Icon
                icon='user'
                width={isMobile ? 22 : 18}
                height={isMobile ? 22 : 18}
                fill='#061826'
              />
            </span>
          </button>
        </Dropdown>
      </div>
    </Layout.Header>
  );
}

const rootStyles = (collapsed: boolean, isMobileView: boolean) => css`
  background: var(--sidebar-background-color);
  padding: 0;
  height: var(--header-height);
  position: fixed;
  right: 0;
  z-index: 99;
  left: ${isMobileView
    ? collapsed
      ? '0'
      : 'var(--mobile-expanded-sidebar-width)'
    : collapsed
      ? 'var(--collapsed-sidebar-width)'
      : 'var(--expanded-sidebar-width)'};
  transition: left 0.25s ease;
  border-bottom: 0.1rem solid var(--shell-divider-color);
  padding-right: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${isMobileView ? '0 1rem' : '0 2rem'};
  gap: ${isMobileView ? '1.2rem' : '2rem'};
`;

const leftSectionStyles = (isMobileView: boolean) => css`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: ${isMobileView ? '100%' : 'unset'};
  flex: 1;
  min-width: 0;
`;

const searchWrapperStyles = (isDesktopView: boolean) => css`
  max-width: 34rem;
  min-width: ${isDesktopView ? '30rem' : 'unset'};
  width: 100%;
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 4.4rem;
  padding: 0 0.6rem 0 1.6rem;
  background: var(--surface-elevated-color);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  box-shadow: none;
  overflow: hidden;

  :root[data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
`;

const searchInputStyles = css`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 1.45rem;
  font-weight: 500;
  padding: 0 6.8rem 0 0;

  &::placeholder {
    color: var(--text-tertiary-color);
  }
`;

const searchClearBtnStyles = css`
  position: absolute;
  top: 50%;
  right: 4.3rem;
  transform: translateY(-50%);
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-tertiary-color);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
`;

const searchActionBtnStyles = css`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  width: 3.6rem;
  min-width: 3.6rem;
  height: 3.6rem !important;
  padding: 0;
  border: none !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d7dff 0%, #19c8ff 100%) !important;
  box-shadow: none;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #1a88ff 0%, #28d0ff 100%) !important;
  }
`;

const searchActionIconStyles = css`
  color: var(--white-color);
  font-size: 1.7rem;
`;

const breakingNewsStyles = (isMobileView: boolean) => css`
  ${isMobileView
    ? `
      flex: 1;
      min-width: 0;
      display: flex;
      justify-content: flex-start;
    `
    : `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: min(56rem, calc(100% - 76rem));
      min-width: 36rem;
      display: flex;
      justify-content: center;
      pointer-events: none;

      > * {
        pointer-events: auto;
      }
    `}
`;

const rightSectionStyles = (isMobileView: boolean) => css`
  display: flex;
  gap: ${isMobileView ? '0.6rem' : '1rem'};
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

const menuIconStyles = css`
  cursor: pointer;
  margin-right: 0.6rem;
  &:hover {
    opacity: 0.85;
  }
`;

const userDropdownBtnStyles = (showUserFullName: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${showUserFullName ? '0.8rem' : '0'};
  height: 3.8rem;
  padding: ${showUserFullName ? '0 0.45rem 0 1.15rem' : '0'};
  border-radius: 999px;
  border: 1px solid var(--header-chip-border-color);
  background: var(--header-chip-background-color);
  box-shadow: none;
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    background: var(--header-chip-hover-background-color);
    box-shadow: none;
  }

  &:focus,
  &:focus-visible,
  &:active {
    border-color: var(--primary-color);
    background: var(--header-chip-hover-background-color);
    color: var(--text-color);
    box-shadow: none;
    outline: none;
  }

  :root[data-theme='dark'] & {
    box-shadow: none;

    &:hover {
      border-color: var(--primary-color);
      background: var(--header-chip-hover-background-color);
      box-shadow: none;
    }
  }
`;

const userNameStyles = css`
  display: block;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.32rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-color);
`;

const userAvatarChipStyles = (isMobileView: boolean) => css`
  width: ${isMobileView ? '2.65rem' : '2.95rem'};
  height: ${isMobileView ? '2.65rem' : '2.95rem'};
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #24a7f4 0%, #5ed7ff 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 0.3rem 0.75rem rgba(28, 154, 223, 0.16);
`;
