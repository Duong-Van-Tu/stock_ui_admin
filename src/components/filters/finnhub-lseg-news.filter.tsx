/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button, Select } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { SelectFilter } from './select-filter';
import { useEffect, useMemo, useRef } from 'react';
import { isDesktop, isMobile } from 'react-device-detect';
import { useRouter, useSearchParams } from 'next/navigation';
import { TimeZone } from '@/constants/timezone.constant';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getIndustriesV2,
  getSectorsV2,
  watchIndustries,
  watchSectors
} from '@/redux/slices/stock-score.slice';
import { useTranslations } from 'next-intl';

type Props = {
  customStyles?: SerializedStyles;
  onFilter: (values: SentimentFilter) => void;
  onFilterReady: (values: SentimentFilter) => void;
};

export const FinnhubAndLsegNewsFilter = ({
  customStyles,
  onFilter,
  onFilterReady
}: Props) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const isFirstRender = useRef(true);
  const dispatch = useAppDispatch();

  const industries = useAppSelector(watchIndustries);
  const sectors = useAppSelector(watchSectors);

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
      sector?: string;
      industry?: string;
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
    const sector = v.sector;
    const industry = v.industry;

    updateSearchParams({
      sourceType,
      startDate,
      endDate,
      sector,
      industry
    });

    onFilter({
      startDate,
      endDate,
      sourceType,
      symbol: symbol || undefined,
      sector: sector || '',
      industry: industry
        ? industry.includes(' & ')
          ? industry.replace(/ & /g, ' @ ')
          : industry
        : ''
    });
  };

  const submit = () => triggerFilter();

  const handleClear = () => {
    const end = dayjs().tz(TimeZone.NEW_YORK);
    const start = end.subtract(2, 'day');

    form.setFieldsValue({
      sourceType: 'lseg',
      range: [start, end],
      sector: '',
      industry: ''
    });

    updateSearchParams({
      sourceType: undefined,
      startDate: start.startOf('day').toISOString(),
      endDate: end.endOf('day').toISOString(),
      sector: undefined,
      industry: undefined
    });

    triggerFilter();
  };

  useEffect(() => {
    dispatch(getSectorsV2());
  }, [dispatch]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const sourceTypeFromUrl = searchParams.get('sourceType') ?? 'lseg';
      const startDateFromUrl = searchParams.get('startDate');
      const endDateFromUrl = searchParams.get('endDate');
      const sectorFromUrl = searchParams.get('sector');
      const industryFromUrl = searchParams.get('industry');

      if (sectorFromUrl) {
        dispatch(getIndustriesV2(sectorFromUrl));
      }

      const initialValues: Record<string, any> = {
        sourceType: sourceTypeFromUrl
      };

      let startDate, endDate;

      if (startDateFromUrl && endDateFromUrl) {
        startDate = dayjs(startDateFromUrl).tz(TimeZone.NEW_YORK);
        endDate = dayjs(endDateFromUrl).tz(TimeZone.NEW_YORK);
        initialValues.range = [startDate, endDate];
      } else {
        const end = dayjs().tz(TimeZone.NEW_YORK);
        const start = end.subtract(2, 'day');
        startDate = start;
        endDate = end;
        initialValues.range = [start, end];
      }

      if (sectorFromUrl) {
        initialValues.sector = sectorFromUrl;
      }

      if (industryFromUrl) {
        initialValues.industry = industryFromUrl;
      }

      form.setFieldsValue(initialValues);

      onFilterReady({
        sourceType: sourceTypeFromUrl,
        startDate: startDate?.startOf('day').toISOString(),
        endDate: endDate?.endOf('day').toISOString(),
        sector: sectorFromUrl || '',
        industry: industryFromUrl
          ? industryFromUrl.includes(' & ')
            ? industryFromUrl.replace(/ & /g, ' @ ')
            : industryFromUrl
          : '',
        symbol: symbol || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form, symbol, dispatch]);

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
            <Form.Item css={formItemStyles} name='sector'>
              <Select
                css={selectStyles}
                allowClear
                showSearch
                placeholder={t('allSector')}
                optionFilterProp='label'
                options={sectorOptions}
                onChange={(value) => {
                  form.setFieldValue('industry', '');
                  if (value) dispatch(getIndustriesV2(value as string));
                  triggerFilter();
                }}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='industry'>
              <Select
                css={selectStyles}
                allowClear
                showSearch
                placeholder={t('searchSelectIndustry')}
                optionFilterProp='label'
                options={industryOptions}
                disabled={!form.getFieldValue('sector')}
                onChange={() => {
                  triggerFilter();
                }}
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

const selectStyles = css`
  width: ${isMobile ? 'calc(100vw - 5rem)' : '20rem !important'};
`;
