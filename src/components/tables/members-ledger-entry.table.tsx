/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Table, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getMembers, watchMembers } from '@/redux/slices/members.slice';
import { useWindowSize } from '@/hooks/window-size.hook';
import { useTranslations } from 'next-intl';

export function MembersLedgerEntry() {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const members = useAppSelector(watchMembers);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const uniqueMembers = members.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.email === member.email)
  );

  useEffect(() => {
    dispatch(getMembers());
  }, [dispatch]);

  const handleSendAlert = (member: Member) => {
    message.success(`Alert sent to ${member.username}`);
  };

  const handleSendBulkAlert = () => {
    const selectedMembers = uniqueMembers.filter((member) =>
      selectedRowKeys.includes(member.id)
    );
    message.success(`Alert sent to ${selectedMembers.length} members`);
  };

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
      render: (_, record) => (
        <Button type='link' onClick={() => handleSendAlert(record)}>
          Send Alert
        </Button>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={actionHeaderStyles}>
        <Button
          type='primary'
          disabled={selectedRowKeys.length === 0}
          onClick={handleSendBulkAlert}
        >
          Send Alert to Selected
        </Button>
      </div>
      <Table
        dataSource={uniqueMembers}
        columns={columns}
        rowKey='id'
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        scroll={{
          x: 1300,
          y: members.length > 0 ? height - 200 : undefined
        }}
      />
    </div>
  );
}

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
  padding: 1rem;
`;

const actionHeaderStyles = css`
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
`;
