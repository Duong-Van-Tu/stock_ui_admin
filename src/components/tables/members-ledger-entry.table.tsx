/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Table, Button, Tooltip, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
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

export function MembersLedgerEntry() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { height } = useWindowSize();
  const [modal, contextHolder] = Modal.useModal();

  const dispatch = useAppDispatch();
  const { notifySuccess, notifyError } = useNotification();

  const ledgerEntry = useAppSelector(watchSelectedLedgerEntry);
  const members = useAppSelector(watchMembers);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const uniqueMembers = members.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.email === member.email)
  );

  const confirmSendAlert = (member: Member) => {
    modal.confirm({
      title: (
        <Title css={titleConfirmStyles} level={4}>
          Send Notification
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
          Send a notification to member{' '}
          <strong>
            <i>{member.username}</i>
          </strong>
        </div>
      ),
      okText: 'Send',
      cancelText: 'Close',
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
          Send Notification
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
          Send notifications to <strong>{selectedMembers.length}</strong>{' '}
          selected members?
        </div>
      ),
      okText: 'Send',
      cancelText: 'Cancel',
      onOk: () => handleSendBulkAlert()
    });
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
      notifySuccess('Notification sent successfully!');
    } else {
      notifyError('Failed to send notification');
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
      notifySuccess(
        `Notification sent to ${selectedMembers.length} members successfully!`
      );
      setSelectedRowKeys([]);
    } else {
      notifyError('Failed to send notifications to selected members');
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
      fixed: 'left',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Telegram',
      dataIndex: 'telegram',
      key: 'telegram'
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Button
          css={sendBtnStyles}
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
          Send Alert
        </Button>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <div css={rootStyles}>
        <Title level={3} css={titleStyles}>
          Members list
        </Title>
        <Tooltip title={t('back')} css={goBackStyles}>
          <Button
            shape='circle'
            icon={<Icon icon='back' width={18} height={18} />}
            onClick={handleGoBack}
          />
        </Tooltip>
        <div css={actionHeaderStyles}>
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
            Send Alert Selected
          </Button>
        </div>
        <Table
          css={tableStyles}
          dataSource={uniqueMembers}
          columns={columns}
          rowKey='id'
          size='middle'
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys)
          }}
          scroll={{
            x: 1300,
            y: members.length > 0 ? height - 250 : undefined
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
