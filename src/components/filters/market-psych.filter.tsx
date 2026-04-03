/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { useSearchParams } from 'next/navigation';
import { MARKET_PSYCH_DATA_TYPES } from '@/constants/common.constant';
import FloatField from '@/components/float-field';
import FloatSelect from '@/components/float-select';

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
  }, [symbol, form, onFilterReady]);

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
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('dateRange')}
                width={isMobile ? '100%' : '26rem'}
              >
                <Form.Item name='range' noStyle>
                  <DatePicker.RangePicker
                    className='brand-ant-picker'
                    placeholder={[t('fromDate'), t('toDate')]}
                    onChange={() => triggerFilter()}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <Form.Item name='dataType' noStyle>
                <FloatSelect
                  label={t('dataType')}
                  width={isMobile ? '100%' : '16rem'}
                  options={dataTypeOptions}
                  placeholder={t('allDataType')}
                  value={form.getFieldValue('dataType') ?? ''}
                  onChange={(value) => {
                    form.setFieldValue('dataType', value ?? '');
                    triggerFilter();
                  }}
                />
              </Form.Item>
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
