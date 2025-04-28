/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getNoteBySignal,
  updateNoteBySignal,
  watchNodeLoading,
  watchNote
} from '@/redux/slices/notes.slice';
import { Form, Input, Button, Spin, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { ReactNode, useCallback, useEffect } from 'react';
import { useModal } from '@/hooks/modal.hook';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';

const { Title } = Typography;

type NotesSignalProps = {
  symbol: string;
  pageName: string;
  title?: string | ReactNode;
};

export const NotesSignal = ({ symbol, pageName, title }: NotesSignalProps) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const [form] = Form.useForm();
  const { closeModal } = useModal();
  const { notifySuccess } = useNotification();
  const note = useAppSelector(watchNote);
  const loading = useAppSelector(watchNodeLoading);
  const fetchNotes = useCallback(() => {
    dispatch(getNoteBySignal({ symbol, pageName }));
  }, [dispatch, symbol, pageName]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (note?.notes) {
      form.setFieldsValue({ notes: note.notes });
    } else {
      form.resetFields();
    }
  }, [note?.notes, form]);

  const onFinish = async (values: { notes: string }) => {
    if (!values.notes.trim()) return;
    const res = await dispatch(
      updateNoteBySignal({
        symbol,
        notes: values.notes,
        pageName
      })
    );

    if (isRequestSuccess(res)) {
      notifySuccess(t('noteUpdatedSuccessfully'));
      closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div>
      <Title css={titleStyles} level={4}>
        {title} ({symbol})
      </Title>

      <Spin spinning={loading}>
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Form.Item
            name='notes'
            label={<strong>{t('notes')}</strong>}
            rules={[{ required: true, message: t('PleaseEnterYourNotes') }]}
          >
            <Input.TextArea placeholder={t('EnterYourNotesHere')} rows={4} />
          </Form.Item>

          <Form.Item css={formFooterStyles}>
            <div css={buttonGroupStyles}>
              <Button onClick={handleCancel}>{t('cancel')}</Button>
              <Button type='primary' htmlType='submit'>
                {t('SaveNote')}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
};

const formFooterStyles = css`
  margin-bottom: 0;
  margin-top: 2rem;
`;

const buttonGroupStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const titleStyles = css`
  margin-top: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
`;
