/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { Dayjs } from 'dayjs';
import { SelectFilter } from './select-filter';
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getIndustriesV2,
  getSectorsV2,
  watchIndustries,
  watchSectors
} from '@/redux/slices/stock-score.slice';
import { isDesktop, isMobile } from 'react-device-detect';
import { useSearchParams } from 'next/navigation';
import { filterPanelStyles } from './filter-panel.styles';

type Props = {
  customStyles?: SerializedStyles;
  onFilter: (values: SentimentFilter) => void;
};

export const ListNewsFilter = ({ customStyles, onFilter }: Props) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const industries = useAppSelector(watchIndustries);
  const sectors = useAppSelector(watchSectors);

  const industryOptions = useMemo(
    () => [
      { value: '', label: t('searchSelectIndustry') },
      ...(industries?.map((item) => ({
        value: item.industry,
        label: item.industry
      })) ?? [])
    ],
    [industries, t]
  );

  const sectorOptions = useMemo(
    () => [
      { value: '', label: t('allSector') },
      ...(sectors?.map((item) => ({
        value: item.sector,
        label: item.sector
      })) ?? [])
    ],
    [t, sectors]
  );

  const triggerFilter = () => {
    const v = form.getFieldsValue() as {
      range?: [Dayjs, Dayjs];
      urgency?: 'all' | 'hot';
      sector?: string;
      industry?: string;
    };
    const from = v.range?.[0]?.startOf('day').toISOString();
    const to = v.range?.[1]?.endOf('day').toISOString();
    const urgency = v.urgency === 'hot' ? [1, 2] : undefined;

    onFilter({
      fromDate: from,
      toDate: to,
      urgency,
      sector: v.sector || undefined,
      industry: v.industry || undefined,
      symbol: symbol || undefined
    });
  };

  const submit = () => {
    triggerFilter();
  };

  const handleClear = () => {
    form.resetFields();
    form.setFieldValue('urgency', 'all');
    form.setFieldValue('sector', '');
    form.setFieldValue('industry', '');
    triggerFilter();
  };

  const handleSelectSector = (value?: string) => {
    form.setFieldValue('sector', value ?? '');
    form.setFieldValue('industry', '');
    if (value) dispatch(getIndustriesV2(value));
    triggerFilter();
  };

  const handleClearSector = () => {
    form.setFieldValue('sector', '');
    form.setFieldValue('industry', '');
    triggerFilter();
  };

  const handleSelectUrgency = (value?: string) => {
    form.setFieldValue('urgency', value ?? 'all');
    triggerFilter();
  };

  const handleClearUrgency = () => {
    form.setFieldValue('urgency', 'all');
    triggerFilter();
  };

  const handleSelectIndustry = (value?: string) => {
    form.setFieldValue('industry', value ?? '');
    triggerFilter();
  };

  const handleClearIndustry = () => {
    form.setFieldValue('industry', '');
    triggerFilter();
  };

  useEffect(() => {
    dispatch(getSectorsV2());
  }, [dispatch]);

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
        initialValues={{ urgency: 'all', sector: '', industry: '' }}
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

          <Col>
            <Form.Item css={formItemStyles} name='urgency' initialValue='all'>
              <SelectFilter
                name='urgency'
                label={t('urgency')}
                options={[
                  { value: 'all', label: t('all') },
                  { value: 'hot', label: t('breakingNews') }
                ]}
                onSelect={handleSelectUrgency}
                onClear={handleClearUrgency}
                width={isMobile ? 'calc(100vw - 5rem)' : '14rem'}
                labelFloating
                value={form.getFieldValue('urgency') ?? 'all'}
              />
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles} name='sector' initialValue=''>
              <SelectFilter
                name='sector'
                label={t('sector')}
                options={sectorOptions}
                onSelect={handleSelectSector}
                onClear={handleClearSector}
                labelFloating
                value={form.getFieldValue('sector') ?? ''}
                width={isMobile ? 'calc(100vw - 5rem)' : '20rem'}
              />
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles} name='industry' initialValue=''>
              <SelectFilter
                name='industry'
                label={t('industry')}
                options={industryOptions}
                onSelect={handleSelectIndustry}
                onClear={handleClearIndustry}
                labelFloating
                value={form.getFieldValue('industry') ?? ''}
                disabled={!form.getFieldValue('sector')}
                width={isMobile ? 'calc(100vw - 5rem)' : '20rem'}
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
  ${filterPanelStyles};
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
