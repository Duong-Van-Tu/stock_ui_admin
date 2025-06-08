/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getNoteBySignal,
  updateNoteBySignal,
  watchNodeLoading,
  watchNote
} from '@/redux/slices/notes.slice';
import { Form, Button, Spin, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useModal } from '@/hooks/modal.hook';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { updateAlertLogsData } from '@/redux/slices/signals.slice';
import { ReactQuillEditor } from '../react-quill-editor';
import { Icon } from '../icons';

const { Title } = Typography;

type NotesSignalProps = {
  signalId: number;
  symbol: string;
  pageName: string;
  title?: string | ReactNode;
};

export const NotesSignal = ({
  symbol,
  pageName,
  title,
  signalId
}: NotesSignalProps) => {
  const dispatch = useAppDispatch();
  const t = useTranslations();
  const [form] = Form.useForm();
  const { closeModal } = useModal();
  const { notifySuccess } = useNotification();
  const note = useAppSelector(watchNote);
  const loading = useAppSelector(watchNodeLoading);
  const [editorValue, setEditorValue] = useState('');

  const fetchNotes = useCallback(() => {
    dispatch(getNoteBySignal({ symbol, pageName }));
  }, [dispatch, symbol, pageName]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (note?.notes) {
      form.setFieldsValue({ notes: note.notes });
      setEditorValue(note.notes);
    } else {
      form.resetFields();
      setEditorValue('');
    }
  }, [note?.notes, form]);

  const onFinish = async (values: { notes: string }) => {
    if (!values.notes || !values.notes.trim()) return;
    const res = await dispatch(
      updateNoteBySignal({
        symbol,
        notes: values.notes,
        pageName
      })
    );

    if (isRequestSuccess(res)) {
      notifySuccess(t('noteUpdatedSuccessfully'));
      dispatch(updateAlertLogsData([{ id: signalId, isNotes: true }]));
      closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <div>
      <Title css={titleStyles} level={4}>
        {title}&nbsp;<span>{`"${symbol}"`}</span>
      </Title>

      <Spin spinning={loading}>
        <Form form={form} layout='vertical' onFinish={onFinish}>
          <Form.Item
            name='notes'
            label={<strong>{t('notes')}</strong>}
            rules={[{ required: true, message: t('PleaseEnterYourNotes') }]}
          >
            <ReactQuillEditor
              value={editorValue}
              onChange={(val) => {
                setEditorValue(val);
                form.setFieldsValue({ notes: val });
              }}
              maxHeight={200}
              showImage={false}
              placeholder={t('EnterYourNotesHere')}
            />
          </Form.Item>

          <Form.Item css={formFooterStyles}>
            <div css={buttonGroupStyles}>
              <Button onClick={handleCancel}>{t('cancel')}</Button>
              <Button
                type='primary'
                htmlType='submit'
                icon={
                  <Icon
                    icon='save'
                    width={18}
                    height={18}
                    fill='var(--white-color)'
                  />
                }
              >
                {t('save')}
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
  justify-content: center;
  gap: 1rem;
  button {
    width: 8rem;
  }
`;

const titleStyles = css`
  margin-top: 1rem;
  text-align: center;
  display: flex;
  justify-content: center;
  span {
    font-style: italic;
  }
`;
