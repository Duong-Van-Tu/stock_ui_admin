import { Button, Card, Space, Table, Tag, Typography } from 'antd';

const columns = [
  {
    title: 'Ma',
    dataIndex: 'symbol',
    key: 'symbol',
  },
  {
    title: 'Ten cong ty',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'San',
    dataIndex: 'exchange',
    key: 'exchange',
    render: (value: string) => <Tag color='green'>{value}</Tag>,
  },
];

const dataSource = [
  {
    key: '1',
    symbol: 'FPT',
    name: 'FPT Corporation',
    exchange: 'HOSE',
  },
  {
    key: '2',
    symbol: 'VCB',
    name: 'Vietcombank',
    exchange: 'HOSE',
  },
];

function StocksPage() {
  return (
    <Card>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Typography.Title level={2} style={{ marginBottom: 0 }}>
              Stocks
            </Typography.Title>
            <Typography.Text type='secondary'>Danh sach ma co phieu mau de bat dau</Typography.Text>
          </div>

          <Button type='primary'>Them co phieu</Button>
        </Space>

        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </Space>
    </Card>
  );
}

export default StocksPage;
