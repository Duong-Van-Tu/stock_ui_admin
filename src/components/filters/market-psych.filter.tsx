/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button, Select } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { useSearchParams } from 'next/navigation';
import { MARKET_PSYCH_DATA_TYPES } from '@/constants/common.constant';

type Props = {
  customStyles?: SerializedStyles;
  onFilter: (values: MarketPsychFilter) => void;
  onFilterReady?: (values: MarketPsychFilter) => void;
};

export const MarketPsychFilter = ({
  customStyles,
  onFilter,
  onFilterReady
}: Props) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const dataTypeOptions = useMemo(
    () => [
      { value: '', label: t('allDataType') },
      ...MARKET_PSYCH_DATA_TYPES.map((item) => ({
        value: item.value,
        label: item.label
      }))
    ],
    [t]
  );

  const triggerFilter = () => {
    const v = form.getFieldsValue();
    onFilter({
      startDate: v.range?.[0]?.format('YYYY-MM-DD'),
      endDate: v.range?.[1]?.format('YYYY-MM-DD'),
      dataType: v.dataType || undefined,
      symbol: symbol || undefined
    });
  };

  const handleClear = () => {
    form.resetFields();
    form.setFieldValue('dataType', '');
    triggerFilter();
  };

  useEffect(() => {
    const v = form.getFieldsValue();
    onFilterReady?.({
      startDate: v.range?.[0]?.format('YYYY-MM-DD'),
      endDate: v.range?.[1]?.format('YYYY-MM-DD'),
      dataType: v.dataType || undefined,
      symbol: symbol || undefined
    });
  }, [symbol]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        layout='horizontal'
        css={formStyles}
        onFinish={triggerFilter}
        initialValues={{ dataType: '' }}
      >
        <Row
          gutter={isDesktop ? [16, 12] : [16, 20]}
          align='bottom'
          justify='end'
        >
          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles} name='range'>
              <DatePicker.RangePicker
                css={fullWidthStyles}
                placeholder={[t('fromDate'), t('toDate')]}
                onChange={() => triggerFilter()}
              />
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles} name='dataType'>
              <Select
                options={dataTypeOptions}
                placeholder={t('dataType')}
                onChange={() => triggerFilter()}
                style={{ width: isMobile ? '100%' : '16rem' }}
              />
            </Form.Item>
          </Col>

          <Col>
            <Space size='small'>
              <Button
                htmlType='submit'
                type='primary'
                icon={<SearchOutlined />}
              >
                {t('search')}
              </Button>
              <Button onClick={handleClear} icon={<ClearOutlined />}>
                {t('clear')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const rootStyles = css`
  display: flex;
`;
const formStyles = css`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;
const formItemStyles = css`
  margin-bottom: 0;
`;
const fullWidthStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
`;
