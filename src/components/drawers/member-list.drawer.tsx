/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Table, Button, Drawer, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getMembers, watchMembers } from '@/redux/slices/members.slice';
import { useTranslations } from 'next-intl';
import { Icon } from '../icons';
import Title from 'antd/es/typography/Title';
import { sendAlertLedger } from '@/redux/slices/ledger-entry.slice';
import { isRequestSuccess } from '@/utils/request-status';
import { useNotification } from '@/hooks/notification.hook';
import { isMobile } from 'react-device-detect';
import { stripHtmlFromQuill } from '@/utils/strip-html';

type MemberListDrawerProps = {
  visible: boolean;
  onClose: () => void;
  ledgerEntry: LedgerEntry;
};

export default function MemberListDrawer({
  visible,
  onClose,
  ledgerEntry
}: MemberListDrawerProps) {
  const t = useTranslations();

  const dispatch = useAppDispatch();
  const { notifySuccess, notifyError } = useNotification();

  const members = useAppSelector(watchMembers);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
  const [bulkSending, setBulkSending] = useState(false);
  const [sendAppOnly, setSendAppOnly] = useState(false);

  const uniqueMembers = members
    .filter(
      (member): member is Member =>
        !!member && !!member.email && !!member.username
    )
    .filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.email === member.email)
    );

  const handleSendAlert = async (member: Member) => {
    setSendingMap((prev) => ({ ...prev, [member.id]: true }));

    const cleanNotes = stripHtmlFromQuill(ledgerEntry?.notes || '');
    const res = await dispatch(
      sendAlertLedger({
        emails: [member.email],
        ledgerEntry: {
          ...ledgerEntry!,
          notes: cleanNotes
        },
        telegrams: member.telegram ? [member.telegram] : [],
        sendApp: sendAppOnly
      })
    );
    if (isRequestSuccess(res)) {
      notifySuccess(t('sendSuccess'));
    } else {
      notifyError(t('sendFail'));
    }
    setSendingMap((prev) => ({ ...prev, [member.id]: false }));
  };

  const handleSendBulkAlert = async () => {
    const selectedMembers = uniqueMembers.filter((member) =>
      selectedRowKeys.includes(member.id)
    );

    if (selectedMembers.length === 0) return;

    setBulkSending(true);

    const emails = selectedMembers.map((member) => member.email);
    const telegrams = selectedMembers
      .map((member) => member.telegram)
      .filter(Boolean)
      .filter((tg, index, self) => self.indexOf(tg) === index);

    const cleanNotes = stripHtmlFromQuill(ledgerEntry?.notes || '');

    const res = await dispatch(
      sendAlertLedger({
        emails,
        ledgerEntry: {
          ...ledgerEntry!,
          notes: cleanNotes
        },
        telegrams,
        sendApp: sendAppOnly
      })
    );

    if (isRequestSuccess(res)) {
      notifySuccess(t('sendSuccess'));
      setSelectedRowKeys([]);
    } else {
      notifySuccess(t('sendFail'));
    }
    setBulkSending(false);
  };

  useEffect(() => {
    dispatch(getMembers());
  }, [dispatch]);

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
      width: 120,
      render: (_, record) => {
        const isSending = sendingMap[record.id] ?? false;

        return (
          <Button
            css={sendBtnStyles}
            size='middle'
            type='primary'
            onClick={() => handleSendAlert(record)}
            loading={isSending}
            icon={
              <Icon
                fill='var(--white-color)'
                icon='send'
                width={18}
                height={18}
              />
            }
          >
            {t('send')}
          </Button>
        );
      }
    }
  ];

  return (
    <Drawer
      css={drawerStyles}
      title={t('sendAlertToMembers')}
      open={visible}
      onClose={onClose}
      width={600}
    >
      <div css={rootStyles}>
        <Title level={3} css={titleStyles}>
          {t('membersList')}
        </Title>

        <div css={actionHeaderStyles}>
          <Button
            type='primary'
            css={sendBtnStyles}
            disabled={selectedRowKeys.length === 0}
            onClick={handleSendBulkAlert}
            loading={bulkSending}
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
          <div css={checkboxWrapperStyles}>
            <Checkbox
              checked={sendAppOnly}
              onChange={(e) => setSendAppOnly(e.target.checked)}
            >
              {t('sendOnlyToMyApp')}
            </Checkbox>
          </div>
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
            x: 1100
          }}
        />
      </div>
    </Drawer>
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
  align-items: center;
  .ant-space {
    width: ${isMobile && '100%'};
    justify-content: ${isMobile && 'space-between'};
  }
`;

const checkboxWrapperStyles = css`
  display: flex;
  align-items: center;
`;

const titleStyles = css`
  text-align: center;
  margin-bottom: 0 !important;
`;

const tableStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const sendBtnStyles = css`
  background: var(--sky-pulse);
`;

const drawerStyles = css`
  .ant-drawer-body {
    padding: 1.6rem;
  }
`;
