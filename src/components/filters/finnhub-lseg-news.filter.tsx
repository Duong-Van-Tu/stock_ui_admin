/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { SelectFilter } from './select-filter';
import { useEffect } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  customStyles?: SerializedStyles;
  onFilter: (values: SentimentFilter) => void;
};

export const FinnhubAndLsegNewsFilter = ({ customStyles, onFilter }: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const triggerFilter = () => {
    const v = form.getFieldsValue() as {
      range?: [Dayjs, Dayjs];
      sourceType?: 'all' | 'finnhub' | 'lseg';
    };

    const startDate = v.range?.[0]?.startOf('day').toISOString();
    const endDate = v.range?.[1]?.endOf('day').toISOString();

    const sourceType =
      v.sourceType && v.sourceType !== 'all' ? v.sourceType : undefined;

    updateSearchParams('sourceType', sourceType);

    onFilter({
      startDate,
      endDate,
      sourceType,
      symbol: symbol || undefined
    });
  };

  const submit = () => triggerFilter();

  const handleClear = () => {
    form.resetFields();
    form.setFieldValue('sourceType', 'all');
    form.setFieldValue('range', undefined);
    updateSearchParams('sourceType');
    triggerFilter();
  };

  useEffect(() => {
    const sourceTypeFromUrl = searchParams.get('sourceType') ?? 'all';
    form.setFieldValue('sourceType', sourceTypeFromUrl);
  }, [searchParams, form]);

  useEffect(() => {
    form.submit();
  }, [symbol, form]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        layout='horizontal'
        css={formStyles}
        onFinish={submit}
        initialValues={{ sourceType: 'all' }}
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
                placeholder={['Start date', 'End date']}
                onChange={() => triggerFilter()}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='sourceType'>
              <SelectFilter
                name='sourceType'
                label='Source type'
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'finnhub', label: 'Finnhub' },
                  { value: 'lseg', label: 'LSGE' }
                ]}
                onSelect={(v) => {
                  form.setFieldValue('sourceType', v ?? 'all');
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('sourceType', 'all');
                  triggerFilter();
                }}
                width={isMobile ? 'calc(100vw - 5rem)' : '14rem'}
                labelFloating
                value={form.getFieldValue('sourceType')}
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
                Search
              </Button>
              <Button onClick={handleClear} icon={<ClearOutlined />}>
                Clear
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
