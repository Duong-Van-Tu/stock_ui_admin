import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth.hook';
import { routePaths } from '../router/router.paths';
import { authService } from '../services/auth.service';

type LoginFormValues = LoginPayload;

type RouterState = {
  from?: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectTo = (location.state as RouterState | null)?.from || routePaths.dashboard.absolute;

  const handleFinish = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await authService.login(values);

      login(response.data);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Dang nhap that bai. Vui long thu lai.';

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <Typography.Title level={2}>Dang nhap</Typography.Title>
        <Typography.Paragraph type='secondary'>
          Nhap tai khoan quan tri de truy cap he thong stock admin.
        </Typography.Paragraph>

        {errorMessage ? (
          <Alert type='error' showIcon message={errorMessage} style={{ marginBottom: 16 }} />
        ) : null}

        <Form<LoginFormValues> layout='vertical' onFinish={handleFinish}>
          <Form.Item
            label='Username'
            name='username'
            rules={[{ required: true, message: 'Vui long nhap username' }]}
          >
            <Input placeholder='Nhap username' />
          </Form.Item>

          <Form.Item
            label='Password'
            name='password'
            rules={[{ required: true, message: 'Vui long nhap password' }]}
          >
            <Input.Password placeholder='Nhap password' />
          </Form.Item>

          <Button type='primary' htmlType='submit' block loading={isSubmitting}>
            Dang nhap
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
