import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';
import { routePaths } from '../router/router.paths';

function NotFoundPage() {
  return (
    <Result
      status='404'
      title='404'
      subTitle='Trang ban tim khong ton tai.'
      extra={
        <Button type='primary'>
          <Link to={routePaths.dashboard.absolute}>Ve dashboard</Link>
        </Button>
      }
    />
  );
}

export default NotFoundPage;
