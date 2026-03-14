import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useLanguage } from '../hooks/use-language.hook';

function DashboardPage() {
  const { t } = useLanguage();
  const mockStats = [
    { title: t('dashboardTotalStocks'), value: 128 },
    { title: t('dashboardWatchlist'), value: 42 },
    { title: t('dashboardNeedUpdate'), value: 9 },
  ];

  return (
    <div>
      <Typography.Title level={2}>{t('dashboardTitle')}</Typography.Title>
      <Typography.Paragraph type='secondary'>{t('dashboardDescription')}</Typography.Paragraph>

      <Row gutter={[16, 16]}>
        {mockStats.map((item) => (
          <Col xs={24} md={8} key={item.title}>
            <Card>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default DashboardPage;
