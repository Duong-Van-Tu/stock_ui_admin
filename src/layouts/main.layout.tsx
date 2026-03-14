import { Button, Layout, Menu, Select, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/use-auth.hook';
import { useLanguage } from '../hooks/use-language.hook';
import { LANGUAGE_CODES } from '../constants/language.constants';
import { routePaths } from '../router/router.paths';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: #f5f7fa;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  padding-inline: 24px;
`;

const BrandTitle = styled(Title).attrs({ level: 4 })`
  && {
    color: #fff;
    margin: 0;
  }
`;

const BrandDescription = styled(Text)`
  && {
    color: #cbd5e1;
  }
`;

const HeaderActions = styled(Space)`
  && {
    flex: 1;
    justify-content: flex-end;
  }
`;

const StyledMenu = styled(Menu)`
  && {
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
    background: transparent;
  }
`;

const LanguageSelectWrapper = styled.div`
  min-width: 120px;
`;

const StyledContent = styled(Content)`
  padding: 24px;
`;

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const menuItems: MenuProps['items'] = [
    {
      key: routePaths.dashboard.absolute,
      label: <Link to={routePaths.dashboard.absolute}>{t('menuDashboard')}</Link>,
    },
    {
      key: routePaths.stocks.absolute,
      label: <Link to={routePaths.stocks.absolute}>{t('menuStocks')}</Link>,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate(routePaths.login.absolute, { replace: true });
  };

  const handleLanguageChange = (language: string) => {
    void changeLanguage(language);
  };

  return (
    <StyledLayout>
      <StyledHeader>
        <div>
          <BrandTitle>{t('commonAppName')}</BrandTitle>
          <BrandDescription>{t('commonAppDescription')}</BrandDescription>
        </div>

        <HeaderActions size='middle'>
          <StyledMenu
            theme='dark'
            mode='horizontal'
            selectedKeys={[location.pathname]}
            items={menuItems}
          />
          <LanguageSelectWrapper>
            <Select
              value={currentLanguage}
              onChange={(value) => handleLanguageChange(String(value))}
              options={[
                { label: t('commonVietnamese'), value: LANGUAGE_CODES.vi },
                { label: t('commonEnglish'), value: LANGUAGE_CODES.en },
              ]}
            />
          </LanguageSelectWrapper>
          <Button onClick={handleLogout}>{t('commonLogout')}</Button>
        </HeaderActions>
      </StyledHeader>

      <StyledContent>
        <Outlet />
      </StyledContent>
    </StyledLayout>
  );
}

export default MainLayout;
