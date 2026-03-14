import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import styled from 'styled-components';
import { useLanguage } from '../hooks/use-language.hook';

const PageCard = styled(Card)`
  width: 100%;
`;

const VerticalSpace = styled(Space)`
  && {
    width: 100%;
  }
`;

const HeaderSpace = styled(Space)`
  && {
    width: 100%;
    justify-content: space-between;
  }
`;

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
  const { t } = useLanguage();
  const columns = [
    {
      title: t('stocksSymbol'),
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: t('stocksCompanyName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('stocksExchange'),
      dataIndex: 'exchange',
      key: 'exchange',
      render: (value: string) => <Tag color='green'>{value}</Tag>,
    },
  ];

  return (
    <PageCard>
      <VerticalSpace direction='vertical' size='large'>
        <HeaderSpace>
          <Typography.Text type='secondary'>{t('stocksDescription')}</Typography.Text>

          <Button type='primary'>{t('stocksAdd')}</Button>
        </HeaderSpace>

        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </VerticalSpace>
    </PageCard>
  );
}

export default StocksPage;
