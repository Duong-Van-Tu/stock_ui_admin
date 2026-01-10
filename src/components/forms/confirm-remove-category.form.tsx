/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Button, Typography, Spin } from 'antd';
import { useModal } from '@/hooks/modal.hook';
import { useTranslations } from 'next-intl';
import { useAppDispatch } from '@/redux/hooks';
import { deleteAlertLogInCategory } from '@/redux/slices/signals.slice';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { Dispatch, ReactNode, SetStateAction } from 'react';

type ConfirmRemoveCategoryProps = {
  alertLogId?: number;
  alertLogIds?: number[];
  categoryId: number;
  categoryName: string;
  title: string | ReactNode;
  description?: string;
  onSuccess?: () => void;
  setSelectedIds?: Dispatch<SetStateAction<Set<string>>>;
};

export const ConfirmRemoveCategory = ({
  alertLogId,
  alertLogIds,
  categoryId,
  title,
  description,
  onSuccess,
  setSelectedIds
}: ConfirmRemoveCategoryProps) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();
  const { notifySuccess, notifyError } = useNotification();

  const handleFinish = async () => {
    const ids = alertLogIds || (alertLogId ? [alertLogId] : []);
    const res = await dispatch(
      deleteAlertLogInCategory({ alertLogIds: ids, categoryId })
    );

    if (isRequestSuccess(res)) {
      notifySuccess(t('removeFromCategorySuccess'));
      onSuccess?.();
      setSelectedIds?.(new Set());
      closeModal();
    } else {
      notifyError(t('removeFromCategoryFailed'));
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <Spin spinning={false}>
      <Typography.Title css={titleStyles} level={4}>
        {title}
      </Typography.Title>
      <Form form={form} layout='vertical' onFinish={handleFinish}>
        <Typography.Text css={descriptionStyles}>{description}</Typography.Text>
        <Form.Item css={formFooterStyles}>
          <div css={buttonGroupStyles}>
            <Button onClick={handleCancel}>{t('cancel')}</Button>
            <Button htmlType='submit' danger>
              {t('remove')}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

const titleStyles = css`
  margin: 1.4rem 0 !important;
  text-align: center;
`;

const formFooterStyles = css`
  margin-bottom: 0;
  margin-top: 2rem;
`;

const buttonGroupStyles = css`
  display: flex;
  justify-content: center;
  gap: 1rem;
  button {
    width: 8rem;
  }
`;

const descriptionStyles = css`
  text-align: center;
  display: block;
`;
