/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Table, Button, Tooltip, Modal, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getMembers, watchMembers } from '@/redux/slices/members.slice';
import { useWindowSize } from '@/hooks/window-size.hook';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '../icons';
import Title from 'antd/es/typography/Title';
import {
  getLedgerEntryById,
  sendAlertLedger,
  watchSelectedLedgerEntry
} from '@/redux/slices/ledger-entry.slice';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { defaultApiFetcher } from '@/utils/api-instances';
import { isDesktop, isMobile } from 'react-device-detect';
import { useModal } from '@/hooks/modal.hook';
import { LedgerEntryInformation } from '../ledger-entry-information';

export function MembersLedgerEntry() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { height } = useWindowSize();
  const [modal, contextHolder] = Modal.useModal();
  const { openModal } = useModal();

  const dispatch = useAppDispatch();
  const { notifySuccess, notifyError } = useNotification();

  const inputImportRef = useRef<HTMLInputElement>(null);
  const ledgerEntry = useAppSelector(watchSelectedLedgerEntry);
  const members = useAppSelector(watchMembers);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);

  const uniqueMembers = members
    .filter(
      (member): member is Member =>
        !!member && !!member.email && !!member.username
    )
    .filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.email === member.email)
    );

  const confirmSendAlert = (member: Member) => {
    modal.confirm({
      title: (
        <Title css={titleConfirmStyles} level={4}>
          {t('sendNotification')}
        </Title>
      ),
      icon: (
        <Icon
          customStyles={sendIconStyles}
          fill='var(--sky-pulse)'
          icon='send'
          width={20}
          height={20}
        />
      ),
      content: (
        <div>
          {t('sendTo')}&nbsp;
          <strong>
            <i>{member.username}</i>
          </strong>
        </div>
      ),
      okText: t('send'),
      cancelText: t('cancel'),
      onOk: () => handleSendAlert(member)
    });
  };

  const confirmSendBulkAlert = () => {
    const selectedMembers = uniqueMembers.filter((member) =>
      selectedRowKeys.includes(member.id)
    );

    if (selectedMembers.length === 0) return;

    modal.confirm({
      title: (
        <Title css={titleConfirmStyles} level={4}>
          {t('sendNotification')}
        </Title>
      ),
      icon: (
        <Icon
          customStyles={sendIconStyles}
          fill='var(--sky-pulse)'
          icon='send'
          width={20}
          height={20}
        />
      ),
      content: (
        <div>
          {t('sendBulkConfirmStart')} <strong>{selectedMembers.length}</strong>
          &nbsp;
          {t('sendBulkConfirmEnd')}
        </div>
      ),
      okText: t('send'),
      cancelText: t('cancel'),
      onOk: () => handleSendBulkAlert()
    });
  };

  const handleDownloadUserTemplate = async () => {
    setDownloading(true);
    const response = await defaultApiFetcher.get('users/download-template', {
      responseType: 'blob'
    });
    if (!!response) {
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      notifySuccess('Download template successfully!');
    } else {
      notifyError('Download template failed. Please try again.');
    }
    setDownloading(false);
  };

  const handleImportUser = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setImporting(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await defaultApiFetcher.post('users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (response) {
      notifySuccess('Import member list successfully!');
      dispatch(getMembers());
    } else {
      notifyError('Import member list failed. Please try again.');
    }
    setImporting(false);
  };

  const handleSendAlert = async (member: Member) => {
    const res = await dispatch(
      sendAlertLedger({
        emails: [member.email],
        ledgerEntry: ledgerEntry!,
        telegrams: member.telegram ? [member.telegram] : []
      })
    );
    if (isRequestSuccess(res)) {
      notifySuccess(t('sendSuccess'));
    } else {
      notifyError(t('sendFail'));
    }
  };

  const handleSendBulkAlert = async () => {
    const selectedMembers = uniqueMembers.filter((member) =>
      selectedRowKeys.includes(member.id)
    );

    if (selectedMembers.length === 0) return;

    const emails = selectedMembers.map((member) => member.email);
    const telegrams = selectedMembers
      .map((member) => member.telegram)
      .filter(Boolean)
      .filter((tg, index, self) => self.indexOf(tg) === index);

    const res = await dispatch(
      sendAlertLedger({
        emails,
        ledgerEntry: ledgerEntry!,
        telegrams
      })
    );

    if (isRequestSuccess(res)) {
      notifySuccess(t('sendSuccess'));
      setSelectedRowKeys([]);
    } else {
      notifySuccess(t('sendFail'));
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    dispatch(getMembers());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getLedgerEntryById(id));
    }
  }, [id, dispatch]);

  const columns: ColumnsType<Member> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: t('username'),
      dataIndex: 'username',
      key: 'username',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('fullname'),
      dataIndex: 'fullname',
      key: 'fullname',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (value) => (value ? value : '-')
    },
    {
      title: t('telegram'),
      dataIndex: 'telegram',
      key: 'telegram',
      width: 120,
      render: (value) => (value ? value : '-')
    },
    {
      title: t('actions'),
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: isMobile ? 120 : 150,
      render: (_, record) => (
        <Button
          css={sendBtnStyles}
          size='middle'
          type='primary'
          onClick={() => confirmSendAlert(record)}
          icon={
            <Icon
              fill='var(--white-color)'
              icon='send'
              width={18}
              height={18}
            />
          }
        >
          {isMobile ? t('send') : t('sendAlert')}
        </Button>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <div css={rootStyles}>
        <Title level={3} css={titleStyles}>
          {t('membersList')}
        </Title>
        <Tooltip title={isMobile ? null : t('back')} css={goBackStyles}>
          <Button
            shape='circle'
            icon={<Icon icon='back' width={18} height={18} />}
            onClick={handleGoBack}
          />
        </Tooltip>
        <div css={actionHeaderStyles}>
          <Space>
            <Button
              type='primary'
              css={sendBtnStyles}
              disabled={selectedRowKeys.length === 0}
              onClick={confirmSendBulkAlert}
              icon={
                <Icon
                  fill={
                    selectedRowKeys.length === 0
                      ? 'var(--separator-color)'
                      : 'var(--white-color)'
                  }
                  icon='send'
                  width={18}
                  height={18}
                />
              }
            >
              {t('sendSelected')}
            </Button>
            <Button
              type='primary'
              css={entryInfoBtnStyles}
              icon={
                <Icon
                  icon='entry'
                  fill='var(--white-color)'
                  width={18}
                  height={18}
                />
              }
              onClick={() =>
                openModal(<LedgerEntryInformation entry={ledgerEntry!} />, {
                  width: 1200
                })
              }
            >
              {t('entry')}
            </Button>
          </Space>
          {isDesktop && (
            <Space>
              <Button
                onClick={handleDownloadUserTemplate}
                loading={downloading}
                type='primary'
                icon={
                  <Icon
                    fill='var(--brand-blue-color)'
                    icon='download'
                    width={18}
                    height={18}
                  />
                }
                ghost
              >
                {t('downloadUserTemplate')}
              </Button>
              <Button
                type='primary'
                css={importUserBtnStyles}
                loading={importing}
                icon={
                  <Icon
                    fill='var(--white-color)'
                    icon='upload'
                    width={18}
                    height={18}
                  />
                }
                onClick={() => inputImportRef.current?.click()}
              >
                {t('importUserTemplate')}
                <input
                  ref={inputImportRef}
                  type='file'
                  hidden
                  accept='.xlsx,.xls'
                  onChange={handleImportUser}
                />
              </Button>
            </Space>
          )}
        </div>
        <Table
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          dataSource={uniqueMembers}
          columns={columns}
          rowKey='id'
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys)
          }}
          scroll={{
            x: 1100,
            y: members.length > 0 ? height - 240 : undefined
          }}
        />
      </div>
    </>
  );
}

const rootStyles = css`
  border-radius: 0.8rem;
  position: relative;
`;

const actionHeaderStyles = css`
  padding: 2.4rem 0 1.2rem;
  display: flex;
  justify-content: ${isMobile ? 'flex-end' : 'space-between'};
`;

const titleStyles = css`
  text-align: center;
  margin-bottom: 0 !important;
`;

const goBackStyles = css`
  position: absolute;
  top: 0;
  left: 1rem;
`;

const tableStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const sendBtnStyles = css`
  background: var(--sky-pulse);
`;

const sendIconStyles = css`
  margin: 4px 4px 0 0;
`;

const titleConfirmStyles = css`
  margin-bottom: 0 !important;
`;

const importUserBtnStyles = css`
  background: var(--electric-indigo-color);
  &:hover {
    background: var(--electric-indigo-color) !important;
    opacity: 0.9;
  }
`;

const entryInfoBtnStyles = css`
  background: var(--green-color);
  &:hover {
    background: var(--green-color) !important;
    opacity: 0.9;
  }
`;
