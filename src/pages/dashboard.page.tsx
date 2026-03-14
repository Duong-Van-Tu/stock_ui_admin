import { Card, Col, Row, Statistic, Typography } from 'antd';

const mockStats = [
  { title: 'Tong ma co phieu', value: 128 },
  { title: 'Dang theo doi', value: 42 },
  { title: 'Can cap nhat', value: 9 },
];

function DashboardPage() {
  return (
    <div>
      <Typography.Title level={2}>Dashboard</Typography.Title>
      <Typography.Paragraph type='secondary'>
        Trang tong quan de theo doi nhanh tinh hinh du lieu co phieu.
      </Typography.Paragraph>

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
