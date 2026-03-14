import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/use-auth.hook';
import { useLanguage } from '../hooks/use-language.hook';
import { routePaths } from '../router/router.paths';
import { authService } from '../services/auth.service';

type LoginFormValues = LoginPayload;

type RouterState = {
  from?: string;
};

const PageContainer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 420px;
`;

const ErrorAlert = styled(Alert)`
  margin-bottom: 16px;
`;

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();
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
      const message = error instanceof Error ? error.message : t('loginFailed');

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard>
        <Typography.Title level={2}>{t('loginTitle')}</Typography.Title>
        <Typography.Paragraph type='secondary'>{t('loginDescription')}</Typography.Paragraph>

        {errorMessage ? <ErrorAlert type='error' showIcon message={errorMessage} /> : null}

        <Form<LoginFormValues> layout='vertical' onFinish={handleFinish}>
          <Form.Item
            label={t('loginUsername')}
            name='username'
            rules={[{ required: true, message: t('loginUsernameRequired') }]}
          >
            <Input placeholder={t('loginUsernamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('loginPassword')}
            name='password'
            rules={[{ required: true, message: t('loginPasswordRequired') }]}
          >
            <Input.Password placeholder={t('loginPasswordPlaceholder')} />
          </Form.Item>

          <Button type='primary' htmlType='submit' block loading={isSubmitting}>
            {t('loginSubmit')}
          </Button>
        </Form>
      </LoginCard>
    </PageContainer>
  );
}

export default LoginPage;
