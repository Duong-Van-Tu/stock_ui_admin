/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useMemo } from 'react';
import { Button, Input, Typography, Form, Row, Space } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import {
  watchInitialBalance,
  watchTotalProfitLoss
} from '@/redux/slices/ledger-entry.slice';
import { PositiveNegativeText } from '../positive-negative-text';
import { useModal } from '@/hooks/modal.hook';
import { Icon } from '../icons';
import { useTranslations } from 'next-intl';

const { Text } = Typography;
const { TextArea } = Input;

type DepositWithdrawFormValues = {
  amount: number;
  description?: string;
};

type DepositWithdrawFormProps = {
  type: 'deposit' | 'withdraw';
};

export default function DepositWithdrawForm({
  type
}: DepositWithdrawFormProps) {
  const t = useTranslations();
  const [form] = Form.useForm();
  const totalProfitLoss = useAppSelector(watchTotalProfitLoss);
  const initialBalance = useAppSelector(watchInitialBalance);
  const { closeModal } = useModal();

  const availableBalance = useMemo(
    () => totalProfitLoss + initialBalance,
    [totalProfitLoss, initialBalance]
  );

  const handleSetMax = () => {
    form.setFieldsValue({ amount: availableBalance });
  };

  const handleSubmit = async (values: DepositWithdrawFormValues) => {
    console.log({ values });
    form.resetFields();
    closeModal();
  };

  const validateAmount = (_: any, value: number) => {
    if (value === undefined || isNaN(value) || value <= 0) {
      return Promise.reject(t('amountErrorInvalid'));
    }
    if (type === 'withdraw' && value > availableBalance) {
      return Promise.reject(t('amountErrorExceedsBalance'));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Typography.Title
        level={4}
        style={{ textAlign: 'center', marginBottom: 20 }}
      >
        {type === 'withdraw' ? t('withdrawFunds') : t('depositFunds')}
      </Typography.Title>

      <Row justify='space-between'>
        <Text strong>
          {t('totalBalance')}: ${availableBalance.toLocaleString()}
        </Text>
        <Text strong>
          {t('profitLoss')}:{' '}
          <PositiveNegativeText
            isNegative={totalProfitLoss < 0}
            isPositive={totalProfitLoss > 0}
          >
            <span>${totalProfitLoss.toLocaleString()}</span>
          </PositiveNegativeText>
        </Text>
      </Row>

      <Form
        css={formStyles}
        form={form}
        onFinish={handleSubmit}
        layout='vertical'
        validateTrigger='onSubmit'
      >
        <Form.Item
          name='amount'
          label={t('amount')}
          rules={[{ validator: validateAmount }]}
          required
        >
          <Input
            type='number'
            step='0.01'
            size='large'
            addonAfter={
              type === 'withdraw' ? (
                <Button type='link' onClick={handleSetMax} size='small'>
                  {t('maxButton')}
                </Button>
              ) : null
            }
          />
        </Form.Item>

        <Form.Item name='description' label={t('noteOptional')}>
          <TextArea rows={2} size='large' placeholder={t('notePlaceholder')} />
        </Form.Item>

        <Form.Item>
          <Space css={actionStyles}>
            <Button onClick={closeModal}>{t('cancelButton')}</Button>
            <Button
              htmlType='submit'
              type={type === 'deposit' ? 'primary' : 'default'}
              icon={
                type === 'deposit' ? (
                  <Icon icon='deposit' width={18} height={18} />
                ) : (
                  <Icon icon='withdraw' width={18} height={18} />
                )
              }
              danger={type === 'withdraw'}
              ghost={type === 'deposit'}
            >
              {type === 'deposit' ? t('depositButton') : t('withdrawButton')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
}

const formStyles = css`
  margin-top: 1.4rem;
  .ant-form-item:last-child {
    margin-bottom: unset;
  }
`;

const actionStyles = css`
  display: flex;
  justify-content: center;
`;
