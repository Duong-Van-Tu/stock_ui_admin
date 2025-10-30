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
  watchLatestEntryDate
} from '@/redux/slices/signals.slice';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';

type AlertLogsFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: AlertLogsFilter) => void;
};

const { RangePicker } = DatePicker;

const NY_TZ = TimeZone.NEW_YORK;
const fmt = 'YYYY-MM-DD';
const ny = () => dayjs().tz(NY_TZ);

type QuickRange =
  | 'all'
  | 'today'
  | 'lastDay'
  | 'currentWeek'
  | 'lastWeek'
  | 'currentMonth'
  | 'lastMonth';

function getEntryRangeByOption(
  value: QuickRange,
  latestEntryDate?: string | null
): [dayjs.Dayjs | null, dayjs.Dayjs | null] {
  switch (value) {
    case 'today': {
      const d = ny();
      return [d.startOf('day'), d.endOf('day')];
    }
    case 'lastDay': {
      if (latestEntryDate) {
        const d = dayjs(latestEntryDate).tz(NY_TZ);
        return [d.startOf('day'), d.endOf('day')];
      }
      const d = ny().subtract(1, 'day');
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

function useDebounced(fn: (...args: any[]) => void, delay: number) {
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return useCallback(
    (...args: any[]) => {
      if (tRef.current) clearTimeout(tRef.current);
      tRef.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  );
}

export const AlertLogsFilter = ({
  customStyles,
  onFilter
}: AlertLogsFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const defaultQuickRange: QuickRange = useMemo(() => {
    if (!latestEntryDate) return 'today';
    const latestNY = dayjs(latestEntryDate).tz(NY_TZ);
    const todayNY = ny();
    return latestNY.isSame(todayNY, 'day') ? 'today' : 'lastDay';
  }, [latestEntryDate]);

  const strategyOptions = useMemo(
    () => strategies?.map(({ id, name }) => ({ value: id, label: name })),
    [strategies]
  );

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const prevKeyRef = useRef<string | null>(null);
  const debouncedEmit = useDebounced((payload: AlertLogsFilter) => {
    const key = JSON.stringify(payload);
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      onFilter(payload);
    }
  }, 300);

  const handleSearch = useCallback(() => {
    const values = form.getFieldsValue();
    debouncedEmit({
      isImport: isOption ? 1 : 0,
      fromEntryDate: values.entryDate?.[0]?.tz(TimeZone.NEW_YORK).format(fmt),
      toEntryDate: values.entryDate?.[1]?.tz(TimeZone.NEW_YORK).format(fmt),
      fromExitDate: values.exitDate?.[0]?.tz(TimeZone.NEW_YORK).format(fmt),
      toExitDate: values.exitDate?.[1]?.tz(TimeZone.NEW_YORK).format(fmt),
      strategyId: values.strategyId,
      symbol: symbol || undefined
    });
  }, [form, debouncedEmit, isOption, symbol]);

  const handleClearFilters = () => {
    form.resetFields();
    updateSearchParams('strategyId');
    debouncedEmit({
      fromEntryDate: undefined,
      toEntryDate: undefined,
      fromExitDate: undefined,
      toExitDate: undefined,
      strategyId: undefined
    } as AlertLogsFilter);
  };

  const handleQuickRangeChange = useCallback(
    (value: QuickRange) => {
      const [start, end] = getEntryRangeByOption(value, latestEntryDate);
      form.setFieldsValue({
        quickRange: value,
        entryDate: start && end ? [start, end] : undefined
      });
      form.submit();
    },
    [form, latestEntryDate]
  );

  useEffect(() => {
    dispatch(getStrategies());
    dispatch(getLatestEntryDate());
  }, [dispatch]);

  useEffect(() => {
    if (strategyId) {
      form.setFieldValue('strategyId', strategyId);
    }
  }, [form, strategyId]);

  useEffect(() => {
    form.submit();
  }, [symbol, form]);

  useEffect(() => {
    handleQuickRangeChange(defaultQuickRange);
  }, [defaultQuickRange, handleQuickRangeChange]);

  useEffect(() => {
    handleQuickRangeChange(form.getFieldValue('quickRange'));
  }, [isOption, form, handleQuickRangeChange]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='stock-alert-logs-filter'
        onFinish={handleSearch}
        labelCol={{ span: isMobile ? 3 : undefined }}
        css={formStyles}
        layout='horizontal'
        initialValues={{ quickRange: 'today' }}
      >
        <Row gutter={[16, 12]} align='bottom' justify='end'>
          <Col css={fullWidthStyles}>
            <Form.Item
              css={formItemStyles}
              name='strategyId'
              label={<span css={labelStyles}>{t('strategy')}</span>}
            >
              <Select
                css={selectStrategyStyles}
                allowClear
                showSearch
                loading={strategyLoading}
                placeholder={t('searchSelectStrategy')}
                optionFilterProp='label'
                options={strategyOptions}
                onChange={(value) => {
                  updateSearchParams('strategyId', value?.toString());
                  form.submit();
                }}
              />
            </Form.Item>
          </Col>
          <Col css={fullWidthStyles}>
            <Form.Item name='quickRange' css={formItemStyles}>
              <Select
                css={selectQuickRangeStyles}
                options={[
                  { value: 'all', label: t('all') },
                  { value: 'today', label: t('today') },
                  { value: 'lastDay', label: t('lastDay') },
                  { value: 'currentWeek', label: t('currentWeek') },
                  { value: 'lastWeek', label: t('lastWeek') },
                  { value: 'currentMonth', label: t('currentMonth') },
                  { value: 'lastMonth', label: t('lastMonth') }
                ]}
                onChange={(value) =>
                  handleQuickRangeChange(value as QuickRange)
                }
              />
            </Form.Item>
          </Col>
          <Col
            css={css`
              width: ${isMobile ? '100%' : 'unset'};
            `}
          >
            <Form.Item
              css={formItemStyles}
              name='entryDate'
              label={<span css={labelStyles}>{t('entryDate')}</span>}
            >
              <RangePicker
                css={rangePickerStyles}
                format='MM-DD-YYYY'
                allowClear
              />
            </Form.Item>
          </Col>

          <Col
            css={css`
              width: ${isMobile ? '100%' : 'unset'};
            `}
          >
            <Form.Item
              css={formItemStyles}
              name='exitDate'
              label={<span css={labelStyles}>{t('exitDate')}</span>}
            >
              <RangePicker
                css={rangePickerStyles}
                format='MM-DD-YYYY'
                allowClear
              />
            </Form.Item>
          </Col>

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

const labelStyles = css`
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.8rem;
`;

const selectStrategyStyles = css`
  width: ${isMobile ? '100%' : '28rem !important'};
`;
const selectQuickRangeStyles = css`
  width: ${isMobile ? '100%' : '13.8rem !important'};
`;

const rangePickerStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
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
