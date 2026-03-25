/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, DatePicker, Form, Row, Select, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading,
  getLatestEntryDate,
  watchLatestEntryDate,
  watchLatestEntryDateLoading
} from '@/redux/slices/signals.slice';
import {
  getIndustriesV2,
  getSectorsV2,
  watchIndustries,
  watchSectors
} from '@/redux/slices/stock-score.slice';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { PeriodOptions } from '@/constants/common.constant';
import FloatField from '@/components/float-field';

type AlertLogsFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: AlertLogsFilter) => void;
  onFilterReady: (values: AlertLogsFilter) => void;
};

const { RangePicker } = DatePicker;

const NY_TZ = TimeZone.NEW_YORK;
const fmt = 'YYYY-MM-DD';
const latestEntryDateFmt = 'YYYY-MM-DD HH:mm:ss';
const ny = () => dayjs().tz(NY_TZ);
const localTz = () => dayjs.tz.guess();
const parseLatestEntryDateUtc = (value?: string | null) =>
  value ? dayjs.utc(value, latestEntryDateFmt) : null;

const getLatestEntryDateKey = (latestEntryDate?: string | null) =>
  (parseLatestEntryDateUtc(latestEntryDate) ?? dayjs.utc()).format(fmt);

const getLatestEntryDisplayRange = (
  latestEntryDate?: string | null
): [dayjs.Dayjs, dayjs.Dayjs] => {
  const latestEntryDateKey = getLatestEntryDateKey(latestEntryDate);
  const displayDate = dayjs(latestEntryDateKey, fmt);
  return [displayDate.startOf('day'), displayDate.endOf('day')];
};

const formatPickerValueForApi = (
  value?: dayjs.Dayjs | null,
  fallbackDateKey?: string
) => value?.format(fmt) ?? fallbackDateKey;

type QuickRange =
  | 'all'
  | 'today'
  | 'lastDay'
  | 'currentWeek'
  | 'lastWeek'
  | 'currentMonth'
  | 'lastMonth';

function getLatestEntryDay(latestEntryDate?: string | null) {
  return latestEntryDate ? dayjs.utc(latestEntryDate).tz(NY_TZ) : null;
}

function isTradingDay(date: dayjs.Dayjs) {
  const day = date.day();
  return day !== 0 && day !== 6;
}

function isLatestEntryToday(latestEntryDate?: string | null) {
  const latest = getLatestEntryDay(latestEntryDate);
  if (!latest || !isTradingDay(latest)) return false;

  return (
    latest.isSame(ny(), 'day') ||
    latest.tz(localTz()).isSame(dayjs().tz(localTz()), 'day')
  );
}

function getEntryRangeByOption(
  value: QuickRange,
  latestEntryDate?: string | null
): [dayjs.Dayjs | null, dayjs.Dayjs | null] {
  switch (value) {
    case 'today': {
      if (isLatestEntryToday(latestEntryDate)) {
        const latest = getLatestEntryDay(latestEntryDate);
        if (latest) return [latest.startOf('day'), latest.endOf('day')];
      }

      const d = ny();
      return [d.startOf('day'), d.endOf('day')];
    }
    case 'lastDay': {
      if (latestEntryDate) {
        const [start, end] = getLatestEntryDisplayRange(latestEntryDate);
        return [start, end];
      }
      const d = dayjs().subtract(1, 'day');
      return [d.startOf('day'), d.endOf('day')];
    }
    case 'currentWeek': {
      const start = ny().isoWeekday(1).startOf('day');
      const end = ny().isoWeekday(7).endOf('day');
      return [start, end];
    }
    case 'lastWeek': {
      const start = ny().isoWeekday(1).subtract(1, 'week').startOf('day');
      const end = ny().isoWeekday(7).subtract(1, 'week').endOf('day');
      return [start, end];
    }
    case 'currentMonth': {
      const start = ny().startOf('month').startOf('day');
      const end = ny().endOf('month').endOf('day');
      return [start, end];
    }
    case 'lastMonth': {
      const start = ny().subtract(1, 'month').startOf('month').startOf('day');
      const end = ny().subtract(1, 'month').endOf('month').endOf('day');
      return [start, end];
    }
    default:
      return [null, null];
  }
}

export const AlertLogsFilter = ({
  customStyles,
  onFilter,
  onFilterReady
}: AlertLogsFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const isOption = searchParams.get('isOption')
    ? Number(searchParams.get('isOption'))
    : 0;

  const strategyId = searchParams.get('strategyId')
    ? Number(searchParams.get('strategyId'))
    : undefined;

  const symbol = searchParams.get('symbol');

  const strategies = useAppSelector(watchStrategies);
  const strategyLoading = useAppSelector(watchStrategyLoading);
  const latestEntryDate = useAppSelector(watchLatestEntryDate);
  const latestEntryDateLoading = useAppSelector(watchLatestEntryDateLoading);

  const industries = useAppSelector(watchIndustries);
  const sectors = useAppSelector(watchSectors);

  const defaultQuickRange: QuickRange = 'lastDay';
  const defaultEntryDateRange = useMemo(
    () => getLatestEntryDisplayRange(latestEntryDate),
    [latestEntryDate]
  );
  const allStrategyLabel = `${t('all')} ${t('strategy')}`;

  const strategyOptions = useMemo(
    () => [
      { value: '', label: allStrategyLabel },
      ...(strategies?.map(({ id, name }) => ({ value: id, label: name })) ?? [])
    ],
    [allStrategyLabel, strategies]
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

  const periodOptions = Object.values(PeriodOptions).map((value) => ({
    value,
    label: value
  }));

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    const latestEntryDateKey = getLatestEntryDateKey(latestEntryDate);
    onFilter({
      isImport: isOption ? 1 : 0,
      fromEntryDate: formatPickerValueForApi(
        values.entryDate?.[0],
        latestEntryDateKey
      ),
      toEntryDate: formatPickerValueForApi(
        values.entryDate?.[1],
        latestEntryDateKey
      ),
      fromExitDate: formatPickerValueForApi(values.exitDate?.[0]),
      toExitDate: formatPickerValueForApi(values.exitDate?.[1]),
      strategyId: values.strategyId || undefined,
      categoryId: values.categoryId ? Number(values.categoryId) : undefined,
      symbol: symbol || undefined,
      sector: values.sector || '',
      industry: values.industry
        ? values.industry.includes(' & ')
          ? values.industry.replace(/ & /g, ' @ ')
          : values.industry
        : '',
      timeFrame: values.timeFrame || ''
    });
  }, [form, latestEntryDate, onFilter, isOption, symbol]);

  const handleClearFilters = () => {
    form.resetFields();
    updateSearchParams('strategyId');
    updateSearchParams('categoryId');
    handleQuickRangeChange(defaultQuickRange);
    handleSearch();
  };

  const handleQuickRangeChange = useCallback(
    (value: QuickRange) => {
      const [start, end] = getEntryRangeByOption(value, latestEntryDate);
      form.setFieldsValue({
        quickRange: value,
        entryDate: start && end ? [start, end] : undefined
      });
      handleSearch();
    },
    [form, latestEntryDate, handleSearch]
  );

  useEffect(() => {
    dispatch(getStrategies());
    dispatch(getLatestEntryDate());
    dispatch(getSectorsV2());
  }, [dispatch]);

  useEffect(() => {
    if (
      isFirstRender.current &&
      strategies &&
      latestEntryDate &&
      !latestEntryDateLoading
    ) {
      isFirstRender.current = false;
      const [start, end] = getEntryRangeByOption(
        defaultQuickRange,
        latestEntryDate
      );
      const initialValues = {
        quickRange: defaultQuickRange,
        entryDate: start && end ? [start, end] : undefined,
        strategyId: strategyId ?? ''
      };
      form.setFieldsValue(initialValues);

      const filterPayload: AlertLogsFilter = {
        isImport: isOption === 1 ? 1 : 0,
        fromEntryDate: formatPickerValueForApi(
          start,
          getLatestEntryDateKey(latestEntryDate)
        ),
        toEntryDate: formatPickerValueForApi(
          end,
          getLatestEntryDateKey(latestEntryDate)
        ),
        strategyId: strategyId,
        categoryId: searchParams.get('categoryId')
          ? Number(searchParams.get('categoryId'))
          : undefined,
        symbol: symbol || undefined,
        sector: '',
        industry: '',
        timeFrame: ''
      };
      onFilterReady(filterPayload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    defaultQuickRange,
    latestEntryDate,
    latestEntryDateLoading,
    form,
    strategies,
    strategyId
  ]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='stock-alert-logs-filter'
        onFinish={handleSearch}
        labelCol={{ span: isMobile ? 3 : undefined }}
        css={formStyles}
        layout='horizontal'
        initialValues={{
          strategyId: '',
          timeFrame: '',
          quickRange: defaultQuickRange,
          entryDate: defaultEntryDateRange
        }}
      >
        <Row gutter={[16, 12]} align='bottom' justify='end'>
          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('strategy')}
                width={isMobile ? '100%' : '28rem'}
              >
                <Form.Item name='strategyId' noStyle>
                  <Select
                    css={fieldControlStyles}
                    allowClear
                    showSearch
                    loading={strategyLoading}
                    placeholder={allStrategyLabel}
                    optionFilterProp='label'
                    options={strategyOptions}
                    onChange={(value) => {
                      updateSearchParams('strategyId', value?.toString());
                      handleSearch();
                    }}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>
          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('period')}
                width={isMobile ? '100%' : '12rem'}
              >
                <Form.Item name='timeFrame' noStyle>
                  <Select
                    css={fieldControlStyles}
                    allowClear
                    placeholder={t('all')}
                    options={[
                      { value: '', label: t('allPeriod') },
                      ...periodOptions
                    ]}
                    onChange={() => {
                      handleSearch();
                    }}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>
          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('dateRange')}
                width={isMobile ? '100%' : '13.8rem'}
              >
                <Form.Item name='quickRange' noStyle>
                  <Select
                    css={fieldControlStyles}
                    placeholder={t('dateRange')}
                    options={[
                      { value: 'all', label: t('all') },
                      { value: 'today', label: t('today') },
                      { value: 'lastDay', label: t('lastDay') },
                      { value: 'currentWeek', label: t('currentWeek') },
                      { value: 'lastWeek', label: t('lastWeek') },
                      { value: 'currentMonth', label: t('currentMonth') },
                      { value: 'lastMonth', label: t('lastMonth') }
                    ]}
                    onChange={(value) => handleQuickRangeChange(value)}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          <Col
            css={css`
              width: ${isMobile ? '100%' : 'unset'};
            `}
          >
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('entryDate')}
                width={isMobile ? '100%' : '26rem'}
              >
                <Form.Item name='entryDate' noStyle>
                  <RangePicker
                    css={fieldControlStyles}
                    format='MM-DD-YYYY'
                    allowClear
                    placeholder={[t('fromDate'), t('toDate')]}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          <Col
            css={css`
              width: ${isMobile ? '100%' : 'unset'};
            `}
          >
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('exitDate')}
                width={isMobile ? '100%' : '26rem'}
              >
                <Form.Item name='exitDate' noStyle>
                  <RangePicker
                    css={fieldControlStyles}
                    format='MM-DD-YYYY'
                    allowClear
                    placeholder={[t('fromDate'), t('toDate')]}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('sector')}
                width={isMobile ? '100%' : '20rem'}
              >
                <Form.Item name='sector' noStyle>
                  <Select
                    css={fieldControlStyles}
                    allowClear
                    showSearch
                    placeholder={t('allSector')}
                    optionFilterProp='label'
                    options={sectorOptions}
                    onChange={(value) => {
                      form.setFieldValue('industry', '');
                      if (value) dispatch(getIndustriesV2(value as string));
                      handleSearch();
                    }}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          <Col css={fullWidthStyles}>
            <Form.Item css={formItemStyles}>
              <FloatField
                label={t('industry')}
                width={isMobile ? '100%' : '20rem'}
              >
                <Form.Item name='industry' noStyle>
                  <Select
                    css={fieldControlStyles}
                    allowClear
                    showSearch
                    placeholder={t('searchSelectIndustry')}
                    optionFilterProp='label'
                    options={industryOptions}
                    disabled={!form.getFieldValue('sector')}
                    onChange={() => {
                      handleSearch();
                    }}
                  />
                </Form.Item>
              </FloatField>
            </Form.Item>
          </Col>

          {/* Category filter removed per design request */}

          <Col css={actionStyles}>
            <Space size='small'>
              <Button
                htmlType='submit'
                type='primary'
                icon={<SearchOutlined />}
              >
                {t('search')}
              </Button>
              <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
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
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem;
`;

const formStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: ${isMobile ? 'center' : 'flex-end'};
  gap: 1.2rem;
  .ant-form-item-label {
    padding-bottom: 0;
  }
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const fieldControlStyles = css`
  width: 100% !important;
`;

const fullWidthStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
`;

const actionStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
  display: ${isMobile ? 'flex' : 'block'};
  justify-content: ${isMobile ? 'right' : 'unset'};
  margin-top: ${isMobile ? '0.8rem' : 'unset'};
`;
