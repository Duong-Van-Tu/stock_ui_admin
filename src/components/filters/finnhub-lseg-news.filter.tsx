/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Form, Row, Col, DatePicker, Space, Button } from 'antd';
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
      breakingNews?: string;
      topNewsMetadata?: string;
    };

    const startDate = v.range?.[0]?.format('YYYY-MM-DD');
    const endDate = v.range?.[1]?.format('YYYY-MM-DD');

    const sourceType = v.sourceType;
    const sector = v.sector;
    const industry = v.industry;
    const breakingNews = v.breakingNews ? Number(v.breakingNews) : undefined;
    const topNewsMetadata = v.topNewsMetadata
      ? Number(v.topNewsMetadata)
      : undefined;

    updateSearchParams({
      sourceType,
      sector,
      industry,
      breakingNews: v.breakingNews,
      topNewsMetadata: v.topNewsMetadata
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
        : '',
      breakingNews,
      topNewsMetadata
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
      industry: '',
      breakingNews: '',
      topNewsMetadata: ''
    });

    updateSearchParams({
      sourceType: undefined,
      sector: undefined,
      industry: undefined,
      breakingNews: '',
      topNewsMetadata: ''
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
      const sectorFromUrl = searchParams.get('sector') ?? '';
      const industryFromUrl = searchParams.get('industry') ?? '';
      const breakingNewsFromUrl = searchParams.get('breakingNews') ?? '';
      const topNewsMetadataFromUrl = searchParams.get('topNewsMetadata') ?? '';

      if (sectorFromUrl) {
        dispatch(getIndustriesV2(sectorFromUrl));
      }

      const initialValues: Record<string, any> = {
        sourceType: sourceTypeFromUrl,
        breakingNews: breakingNewsFromUrl,
        topNewsMetadata: topNewsMetadataFromUrl,
        sector: sectorFromUrl,
        industry: industryFromUrl
      };

      const end = dayjs();
      const start = end.subtract(2, 'day');
      const startDate = start;
      const endDate = end;
      initialValues.range = [start, end];

      if (sectorFromUrl) {
        initialValues.sector = sectorFromUrl;
      }

      if (industryFromUrl) {
        initialValues.industry = industryFromUrl;
      }

      form.setFieldsValue(initialValues);

      onFilterReady({
        sourceType: sourceTypeFromUrl as 'finnhub' | 'lseg',
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        sector: sectorFromUrl || '',
        industry: industryFromUrl
          ? industryFromUrl.includes(' & ')
            ? industryFromUrl.replace(/ & /g, ' @ ')
            : industryFromUrl
          : '',
        symbol: symbol || undefined,
        breakingNews: breakingNewsFromUrl
          ? Number(breakingNewsFromUrl)
          : undefined,
        topNewsMetadata: topNewsMetadataFromUrl
          ? Number(topNewsMetadataFromUrl)
          : undefined
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
        initialValues={{
          sourceType: 'lseg',
          breakingNews: '',
          topNewsMetadata: '',
          sector: '',
          industry: ''
        }}
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
                width={isMobile ? 'calc(100vw - 5rem)' : '10rem'}
                labelFloating
                value={form.getFieldValue('sourceType')}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='breakingNews'>
              <SelectFilter
                name='breakingNews'
                label={t('breakingNews')}
                options={[
                  { value: '', label: t('searchByBreakingNews') },
                  { value: '2', label: t('allBreakingNews') },
                  { value: '1', label: t('upTrend') },
                  { value: '-1', label: t('downTrend') }
                ]}
                onSelect={(v) => {
                  form.setFieldValue('breakingNews', v ?? '');
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('breakingNews', '');
                  triggerFilter();
                }}
                width={isMobile ? 'calc(100vw - 5rem)' : '21.6rem'}
                labelFloating
                value={form.getFieldValue('breakingNews')}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='topNewsMetadata'>
              <SelectFilter
                name='topNewsMetadata'
                label='Top News'
                options={[
                  { value: '', label: t('all') },
                  { value: '1', label: 'Top News' },
                  { value: '0', label: 'Normal News' }
                ]}
                onSelect={(v) => {
                  form.setFieldValue('topNewsMetadata', v ?? '');
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('topNewsMetadata', '');
                  triggerFilter();
                }}
                width={isMobile ? 'calc(100vw - 5rem)' : '13rem'}
                labelFloating
                value={form.getFieldValue('topNewsMetadata')}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='sector'>
              <SelectFilter
                name='sector'
                label={t('sector')}
                options={sectorOptions}
                onSelect={(value) => {
                  form.setFieldValue('sector', value ?? '');
                  form.setFieldValue('industry', '');
                  if (value) dispatch(getIndustriesV2(value as string));
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('sector', '');
                  form.setFieldValue('industry', '');
                  triggerFilter();
                }}
                width={isMobile ? 'calc(100vw - 5rem)' : '20rem'}
                labelFloating
                value={form.getFieldValue('sector')}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item css={formItemStyles} name='industry'>
              <SelectFilter
                name='industry'
                label={t('industry')}
                options={industryOptions}
                disabled={!form.getFieldValue('sector')}
                onSelect={(value) => {
                  form.setFieldValue('industry', value ?? '');
                  triggerFilter();
                }}
                onClear={() => {
                  form.setFieldValue('industry', '');
                  triggerFilter();
                }}
                width={isMobile ? 'calc(100vw - 5rem)' : '20rem'}
                labelFloating
                value={form.getFieldValue('industry')}
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
