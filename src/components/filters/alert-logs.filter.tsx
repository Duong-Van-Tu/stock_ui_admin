/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, DatePicker, Form, Row, Select, Space, Radio } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading
} from '@/redux/slices/signals.slice';
import { isMobile } from 'react-device-detect';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';

type AlertLogsFilterProps = {
  customStyles?: SerializedStyles;
  defaultStrategyId?: number;
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
  value: QuickRange
): [dayjs.Dayjs | null, dayjs.Dayjs | null] {
  switch (value) {
    case 'today': {
      const d = ny();
      return [d.startOf('day'), d.endOf('day')];
    }
    case 'lastDay': {
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

export const AlertLogsFilter = ({
  customStyles,
  defaultStrategyId,
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

  const strategies = useAppSelector(watchStrategies);
  const strategyLoading = useAppSelector(watchStrategyLoading);

  const strategyOptions = useMemo(
    () => strategies?.map(({ id, name }) => ({ value: id, label: name })),
    [strategies]
  );

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilter({
      isImport: isOption ? 1 : 0,
      fromEntryDate: values.entryDate?.[0]?.tz(TimeZone.NEW_YORK).format(fmt),
      toEntryDate: values.entryDate?.[1]?.tz(TimeZone.NEW_YORK).format(fmt),
      fromExitDate: values.exitDate?.[0]?.tz(TimeZone.NEW_YORK).format(fmt),
      toExitDate: values.exitDate?.[1]?.tz(TimeZone.NEW_YORK).format(fmt),
      strategyId: values.strategyId
    });
  };

  const handleClearFilters = () => {
    form.resetFields();
    updateSearchParams('strategyId');
    onFilter({
      fromEntryDate: undefined,
      toEntryDate: undefined,
      fromExitDate: undefined,
      toExitDate: undefined,
      strategyId: undefined
    });
  };

  const handleQuickRangeChange = useCallback(
    (value: QuickRange) => {
      const [start, end] = getEntryRangeByOption(value);
      form.setFieldsValue({
        quickRange: value,
        entryDate: start && end ? [start, end] : undefined
      });

      form.submit();
    },
    [form]
  );

  useEffect(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    if (defaultStrategyId) {
      form.setFieldValue('strategyId', defaultStrategyId);
    }
  }, [form, defaultStrategyId]);

  useEffect(() => {
    if (!isMobile) {
      const current = form.getFieldValue('quickRange') ?? 'today';
      handleQuickRangeChange(current);
    }
  }, [isOption, handleQuickRangeChange, form]);

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
          <Col css={strategyColumnStyles}>
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
                onSelect={(value) =>
                  updateSearchParams('strategyId', value.toString())
                }
                onClear={() => updateSearchParams('strategyId')}
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
        {!isMobile && (
          <Form.Item name='quickRange' css={quickRangeStyles}>
            <Radio.Group
              css={radioInlineStyles}
              onChange={(e) => handleQuickRangeChange(e.target.value)}
            >
              <Radio value='all'>{t('all')}</Radio>
              <Radio value='today'>{t('today')}</Radio>
              <Radio value='lastDay'>{t('lastDay')}</Radio>
              <Radio value='currentWeek'>{t('currentWeek')}</Radio>
              <Radio value='lastWeek'>{t('lastWeek')}</Radio>
              <Radio value='currentMonth'>{t('currentMonth')}</Radio>
              <Radio value='lastMonth'>{t('lastMonth')}</Radio>
            </Radio.Group>
          </Form.Item>
        )}
      </Form>
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: ${!isMobile ? '1.4rem 1.6rem 0.4rem' : '1.4rem'};
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

const radioInlineStyles = css`
  font-weight: 500;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const labelStyles = css`
  font-size: 1.4rem;
  font-weight: 500;
  line-height: 1.8rem;
`;

const selectStrategyStyles = css`
  width: ${isMobile ? '100%' : '27rem !important'};
`;

const rangePickerStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
`;

const strategyColumnStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
`;

const actionStyles = css`
  width: ${isMobile ? '100%' : 'unset'};
  display: ${isMobile ? 'flex' : 'block'};
  justify-content: ${isMobile ? 'right' : 'unset'};
  margin-top: ${isMobile ? '0.8rem' : 'unset'};
`;

const quickRangeStyles = css`
  margin-bottom: 0;
  .ant-form-item-control-input-content {
    text-align: end;
  }
`;
