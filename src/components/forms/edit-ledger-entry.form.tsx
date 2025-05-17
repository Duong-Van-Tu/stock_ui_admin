/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Spin,
  Typography,
  Row,
  Col,
  Space,
  Tooltip
} from 'antd';
import { useParams } from 'next/navigation';
import { Icon } from '../icons';
import { ReactQuillEditor } from '../react-quill-editor';
import { useTranslations } from 'next-intl';

const { Title } = Typography;
const { Option } = Select;

export default function EditLedgerEntry() {
  const t = useTranslations();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const fetchLedgerEntryDetail = async (id: string) => {};

  useEffect(() => {
    if (id) {
      fetchLedgerEntryDetail(id);
    }
  }, [id]);

  const handleSubmit = async () => {};
  const handleSendAlert = () => {};

  return (
    <Spin spinning={false}>
      <div css={rootStyles}>
        <Title level={3} css={titleStyles}>
          {t('UpdateLedgerEntry')}
        </Title>

        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            action: t('buyToOpenCALL')
          }}
          css={formStyles}
        >
          <Row css={formActionsStyles} justify='space-between'>
            <Col>
              <Tooltip title={t('back')}>
                <Button
                  shape='circle'
                  icon={<Icon icon='back' width={18} height={18} />}
                />
              </Tooltip>
            </Col>
            <Col>
              <Form.Item>
                <Space>
                  <Button
                    css={saveBtnStyles}
                    type='primary'
                    htmlType='submit'
                    loading={false}
                    icon={
                      <Icon
                        icon='save'
                        fill='var(--white-color)'
                        width={18}
                        height={18}
                      />
                    }
                  >
                    {t('save')}
                  </Button>
                  <Button
                    type='primary'
                    danger
                    icon={
                      <Icon
                        icon='trash'
                        width={18}
                        height={18}
                        fill='var(--white-color)'
                      />
                    }
                  >
                    {t('delete')}
                  </Button>
                  <Button
                    onClick={handleSendAlert}
                    type='primary'
                    icon={
                      <Icon
                        fill='var(--white-color)'
                        icon='send'
                        width={18}
                        height={18}
                      />
                    }
                  >
                    {t('sendAlertToMembers')}
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name='symbol'
                label={t('symbol')}
                rules={[{ required: true, message: '' }]}
              >
                <Input
                  size='large'
                  onChange={(e) =>
                    form.setFieldValue('symbol', e.target.value.toUpperCase())
                  }
                />
              </Form.Item>
              <Form.Item name='period' label={t('period')}>
                <Input size='large' css={fullWidthStyles} />
              </Form.Item>
              <Form.Item name='entryDate' label={t('entryDate')}>
                <DatePicker size='large' showTime css={fullWidthStyles} />
              </Form.Item>
              <Form.Item name='entryPrice' label={t('entryPrice')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='stockPL' label={t('stockPL')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='contracts' label={t('contracts')}>
                <InputNumber size='large' min={0} css={fullWidthStyles} />
              </Form.Item>
              <Form.Item name='premiumPaid' label={t('premiumPaid')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item
                name='investmentCashOut'
                label={t('investmentCashOut')}
              >
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='commission' label={t('commission')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name='strategy'
                label={t('strategy')}
                rules={[{ required: true, message: '' }]}
              >
                <Input size='large' />
              </Form.Item>
              <Form.Item name='strike' label={t('strike')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='exitDate' label={t('exitDate')}>
                <DatePicker size='large' showTime css={fullWidthStyles} />
              </Form.Item>
              <Form.Item name='exitPrice' label={t('exitPrice')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='expiration' label={t('expiration')}>
                <DatePicker size='large' css={fullWidthStyles} />
              </Form.Item>
              <Form.Item name='action' label={t('action')}>
                <Select size='large'>
                  <Option value='Buy to Open CALL'>{t('buyToOpenCALL')}</Option>
                  <Option value='Sell to Close CALL'>
                    {t('sellToCloseCALL')}
                  </Option>
                  <Option value='Sell to Open CALL'>
                    {t('sellToOpenCALL')}
                  </Option>
                  <Option value='Buy to Close CALL'>
                    {t('buyToCloseCALL')}
                  </Option>
                  <Option value='Buy to Open PUT'>{t('buyToOpenPUT')}</Option>
                  <Option value='Sell to Close PUT'>
                    {t('sellToClosePUT')}
                  </Option>
                  <Option value='Sell to Open PUT'>{t('sellToOpenPUT')}</Option>
                  <Option value='Buy to Close PUT'>{t('buyToClosePUT')}</Option>
                </Select>
              </Form.Item>
              <Form.Item name='premiumReceive' label={t('premiumReceive')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='investmentCashIn' label={t('investmentCashIn')}>
                <InputNumber
                  size='large'
                  min={0}
                  prefix='$'
                  css={fullWidthStyles}
                />
              </Form.Item>
              <Form.Item name='sector' label={t('sector')}>
                <Select size='large' placeholder={t('selectSector')}></Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='notes'
            label={<strong>{t('notes')}</strong>}
            rules={[{ required: true, message: '' }]}
          >
            <ReactQuillEditor
              value=''
              onChange={() => {}}
              placeholder={t('EnterYourNotesHere')}
            />
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const formStyles = css`
  margin-top: 1rem;
  width: 100%;
  padding: 0 2rem;
  .ant-form-item {
    margin-bottom: 1rem;
    label {
      font-weight: 500;
    }
  }
`;

const titleStyles = css`
  text-align: center;
  margin-bottom: 0 !important;
`;

const formActionsStyles = css`
  margin-bottom: 1rem;
`;

const fullWidthStyles = css`
  width: 100%;
`;

const saveBtnStyles = css`
  background: var(--green-color);
  &:hover {
    background: var(--green-color) !important;
    opacity: 0.85;
  }
`;
