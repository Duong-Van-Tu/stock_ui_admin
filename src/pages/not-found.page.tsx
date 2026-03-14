import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/use-language.hook';
import { routePaths } from '../router/router.paths';

function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <Result
      status='404'
      title='404'
      subTitle={t('notFoundDescription')}
      extra={
        <Button type='primary'>
          <Link to={routePaths.dashboard.absolute}>{t('notFoundBackToDashboard')}</Link>
        </Button>
      }
    />
  );
}

export default NotFoundPage;
