/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Button, Typography, Spin } from 'antd';
import dayjs from 'dayjs';
import { useModal } from '@/hooks/modal.hook';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  updateAlertLogsData,
  exitNow,
  watchExitLoading
} from '@/redux/slices/signals.slice';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import { Icon } from '../icons';

type ExitSignalProps = {
  ids: string[];
  title: string | ReactNode;
  description?: string;
  setSelectedIds?: Dispatch<SetStateAction<Set<string>>>;
};

export const ExitSignal = ({
  ids,
  title,
  description,
  setSelectedIds
}: ExitSignalProps) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();
  const { notifySuccess } = useNotification();
  const loading = useAppSelector(watchExitLoading);

  const handleFinish = async () => {
    const res = await dispatch(exitNow({ hashIds: ids }));
    if (isRequestSuccess(res)) {
      notifySuccess(t('exitNowSuccess'));
      await dispatch(
        updateAlertLogsData(
          ids.map((id: string) => ({
            hashAlertLogId: id,
            exitDate: dayjs().utc().toISOString()
          }))
        )
      );
      setSelectedIds?.(new Set());
      closeModal();
    } else {
      notifySuccess(t('exitNowFailed'));
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <Spin spinning={loading}>
      <Typography.Title css={titleStyles} level={4}>
        {title}
      </Typography.Title>
      <Form
        form={form}
        layout='vertical'
        onFinish={handleFinish}
        initialValues={{
          scheduleExitDate: dayjs()
        }}
      >
        <Typography.Text css={descriptionStyles}>{description}</Typography.Text>
        <Form.Item css={formFooterStyles}>
          <div css={buttonGroupStyles}>
            <Button onClick={handleCancel}>{t('cancel')}</Button>
            <Button
              icon={<Icon icon='exit' width={18} height={18} />}
              htmlType='submit'
              danger
            >
              {t('exit')}
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
