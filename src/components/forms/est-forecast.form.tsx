/** @jsxImportSource @emotion/react */
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Row,
  Col
} from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';

type Props = {
  visible: boolean;
  initialValues?: Record<string, any> | null;
  mode?: 'add' | 'edit';
  onCancel: () => void;
  onSubmit: (values: Record<string, any>) => void;
};

const { Option } = Select;

const FORECAST_COLORS = ['#52c41a', '#fadb14', '#fa8c16', '#ff4d4f'];

export default function EstForecastForm({
  visible,
  initialValues,
  mode = 'edit',
  onCancel,
  onSubmit
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      const values = { ...initialValues };
      for (const key in values) {
        if (key.toLowerCase().includes('date') && values[key]) {
          values[key] = dayjs(values[key]);
        }
      }
      form.setFieldsValue(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialValues]);

  const handleFinish = (values: any) => {
    const payload = {
      ...initialValues,
      ...values
    };
    for (const key in payload) {
      if (
        key.toLowerCase().includes('date') &&
        payload[key] &&
        dayjs.isDayjs(payload[key])
      ) {
        payload[key] = (payload[key] as dayjs.Dayjs).format('YYYY-MM-DD');
      }
    }
    onSubmit(payload);
  };

  const formItemLayout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 }
  };

  const modalTitle =
    mode === 'add' ? (
      'Add Est Forecast'
    ) : (
      <div style={{ fontSize: '2rem', textAlign: 'center', width: '100%' }}>
        Edit -{' '}
        <span style={{ color: 'var(--symbol-color)' }}>
          {initialValues?.symbol}
        </span>
      </div>
    );

  return (
    <Modal
      open={visible}
      title={modalTitle}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        {...formItemLayout}
        layout='horizontal'
        labelAlign='left'
        onFinish={handleFinish}
        css={{
          '.ant-form-item-label > label': {
            fontWeight: 500
          },
          '.ant-form-item': {
            marginBottom: '1.2rem'
          }
        }}
        style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '16px' }}
      >
        <Form.Item name='symbol' label='Symbol'>
          <Input disabled />
        </Form.Item>

        <Form.Item name='company' label='Company name'>
          <Input />
        </Form.Item>

        <Form.Item name='earningsDate' label='Earnings Date'>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name='tradeDate' label='Trade Date'>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name='industry' label='Industry'>
          <Input />
        </Form.Item>

        <Form.Item name='callTime' label='Call Time'>
          <Input />
        </Form.Item>

        <Form.Item name='beta' label='Beta'>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name='marketCapEstForecast' label='Market Cap'>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label='EPS Estimate / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='epsEstimateESTEarnings' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='epsEstimatePoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Revenue Forecast / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='revenueForecast' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='revenueForecastPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Net Margin / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='netMargin' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='netMarginPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='EPS Trend / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='epsTrend' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='epsTrendPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='EPS Beat Freq / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='epsBeatFreq' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='epsBeatFreqPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Avg Surprise / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='avgSurpriseMagnitude' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='avgSurpriseMagnitudePoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Revenue Beat Freq / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='revenueBeatFreq' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='revenueBeatFreqPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Post Earning Drift / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='postEarningDrift' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='postEarningDriftPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='YTD Performance / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='ytdPerformance' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='ytdPerformancePoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='AI Rating / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='aiRating' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='aiRatingPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Aggregate Score / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='aggregateScore' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='aggregateScorePoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Yahoo Rec / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='yahooRec' noStyle>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='yahooRecPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Price Target / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='priceTarget' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='priceTargetPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='Grok / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='grok' noStyle>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='grokPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='GPT / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='gpt' noStyle>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='gptPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='GPT Rating / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='gptRating' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='gptRatingPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='LSEG News (1D) / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='lsegNewsScore1d' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='lsegNewsScore1dPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='LSEG News (3D) / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='lsegNewsScore3d' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='lsegNewsScore3dPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          name='lsegNewsTotalScorePoint'
          label='LSEG Total Score Point'
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label='Article 12h / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='article12h' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='article12hPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Earnings Dir / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychEarningsDirectionZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychEarningsDirectionZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Earnings Forecast / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychEarningsForecastZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychEarningsForecastZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Revenue Dir / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychRevenueDirectionZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychRevenueDirectionZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Revenue Forecast / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychRevenueForecastZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychRevenueForecastZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Price Up / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychPriceUpZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychPriceUpZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Optimism / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychOptimismZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychOptimismZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label='MP Trust / Point'>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name='marketpsychTrustZ' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='marketpsychTrustZPoint' noStyle>
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item name='noteForTrader' label='Note for Trader'>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name='forecast' label='Forecast Color'>
          <Select>
            {FORECAST_COLORS.map((c) => (
              <Option key={c} value={c}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      background: c,
                      borderRadius: 4
                    }}
                  />
                  <span>{c}</span>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
