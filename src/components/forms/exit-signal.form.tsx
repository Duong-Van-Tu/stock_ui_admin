/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Button, DatePicker, Typography, Spin } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { useModal } from '@/hooks/modal.hook';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  updateAlertLogsData,
  updateScheduleExitDate,
  watchExitLoading
} from '@/redux/slices/signals.slice';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { Dispatch, SetStateAction } from 'react';

type ExitSignalProps = {
  ids: number[];
  title: string;
  setSelectedIds?: Dispatch<SetStateAction<Set<number>>>;
};

export const ExitSignal = ({ ids, title, setSelectedIds }: ExitSignalProps) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { closeModal } = useModal();
  const { notifySuccess } = useNotification();
  const loading = useAppSelector(watchExitLoading);

  const handleFinish = async (values: { scheduleExitDate: Dayjs }) => {
    const scheduleExitDate = values.scheduleExitDate
      .tz(TimeZone.NEW_YORK)
      .toISOString();

    const res = await dispatch(
      updateScheduleExitDate({ ids, scheduleExitDate })
    );
    if (isRequestSuccess(res)) {
      notifySuccess(t('updateExitScheduleSuccess'));
      dispatch(
        updateAlertLogsData(
          ids.map((signalId) => ({ id: signalId, scheduleExitDate }))
        )
      );
      setSelectedIds?.(new Set());
      closeModal();
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
        <Form.Item
          label={<span css={labelStyles}>{t('scheduleExitDateLabel')}</span>}
          name='scheduleExitDate'
          rules={[{ required: true, message: t('requiredDate') }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            size='large'
            disabledDate={(current) =>
              current && current < dayjs().startOf('day')
            }
          />
        </Form.Item>

        <Form.Item css={formFooterStyles}>
          <div css={buttonGroupStyles}>
            <Button onClick={handleCancel}>{t('cancel')}</Button>
            <Button type='primary' htmlType='submit'>
              {t('update')}
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

const labelStyles = css`
  font-weight: 500;
`;

const buttonGroupStyles = css`
  display: flex;
  justify-content: center;
  gap: 1rem;
  button {
    width: 8rem;
  }
`;
