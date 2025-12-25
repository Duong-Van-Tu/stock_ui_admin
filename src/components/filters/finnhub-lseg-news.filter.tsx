/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { SelectFilter } from './select-filter';
import { useEffect } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { useRouter, useSearchParams } from 'next/navigation';
import { TimeZone } from '@/constants/timezone.constant';

type Props = {
  customStyles?: SerializedStyles;
  onFilter: (values: SentimentFilter) => void;
};

export const FinnhubAndLsegNewsFilter = ({ customStyles, onFilter }: Props) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const updateSearchParams = (
    paramsObj: Record<string, string | undefined>
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(paramsObj).forEach(([key, value]) => {
      value ? params.set(key, value) : params.delete(key);
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const triggerFilter = () => {
    const v = form.getFieldsValue() as {
      range?: [Dayjs, Dayjs];
      sourceType?: 'finnhub' | 'lseg';
    };

    const startDate = v.range?.[0]
      ?.tz(TimeZone.NEW_YORK, true)
      .startOf('day')
      .toISOString();

    const endDate = v.range?.[1]
      ?.tz(TimeZone.NEW_YORK, true)
      .endOf('day')
      .toISOString();

    const sourceType = v.sourceType;

    updateSearchParams({
      sourceType,
      startDate,
      endDate
    });

    onFilter({
      startDate,
      endDate,
      sourceType,
      symbol: symbol || undefined
    });
  };

  const submit = () => triggerFilter();

  const handleClear = () => {
    const end = dayjs().tz(TimeZone.NEW_YORK);
    const start = end.subtract(2, 'day');

    form.setFieldsValue({
      sourceType: 'lseg',
      range: [start, end]
    });

    updateSearchParams({
      sourceType: undefined,
      startDate: start.startOf('day').toISOString(),
      endDate: end.endOf('day').toISOString()
    });

    triggerFilter();
  };

  useEffect(() => {
    const sourceTypeFromUrl = searchParams.get('sourceType') ?? 'lseg';
    const startDateFromUrl = searchParams.get('startDate');
    const endDateFromUrl = searchParams.get('endDate');

    form.setFieldValue('sourceType', sourceTypeFromUrl);

    if (startDateFromUrl && endDateFromUrl) {
      form.setFieldValue('range', [
        dayjs(startDateFromUrl).tz(TimeZone.NEW_YORK),
        dayjs(endDateFromUrl).tz(TimeZone.NEW_YORK)
      ]);
      return;
    }

    const end = dayjs().tz(TimeZone.NEW_YORK);
    const start = end.subtract(2, 'day');

    form.setFieldsValue({
      range: [start, end]
    });
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
        initialValues={{ sourceType: 'lseg' }}
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
                  { value: 'finnhub', label: 'Finnhub' },
                  { value: 'lseg', label: 'LSEG' }
                ]}
                onSelect={(v) => {
                  form.setFieldValue('sourceType', v ?? 'lseg');
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('sourceType', 'lseg');
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
