/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Button, Col, DatePicker, Form, Row, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading
} from '@/redux/slices/signals.slice';
import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type AlertLogsFilterProps = {
  customStyles?: SerializedStyles;
  defaultStrategyId?: number;
  onFilter: (values: AlertLogsFilter) => void;
};

type FormType = {
  entryDate?: [Dayjs, Dayjs];
  exitDate?: [Dayjs, Dayjs];
  strategyId: number;
};

const { RangePicker } = DatePicker;

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

  const strategies = useAppSelector(watchStrategies);
  const strategyLoading = useAppSelector(watchStrategyLoading);

  const strategyOptions = useMemo(
    () =>
      strategies?.map((strategy) => ({
        value: strategy.id,
        label: strategy.name
      })),
    [strategies]
  );

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilter({
      fromEntryDate: values.entryDate?.[0]?.format('YYYY-MM-DD'),
      toEntryDate: values.entryDate?.[1]?.format('YYYY-MM-DD'),
      fromExitDate: values.exitDate?.[0]?.format('YYYY-MM-DD'),
      toExitDate: values.exitDate?.[1]?.format('YYYY-MM-DD'),
      strategyId: values.strategyId
    });
  };

  const handleSelectStrategy = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('strategyId', value.toString());

    router.push(`?${params.toString()}`, { scroll: false });
    form.setFieldValue('strategyId', value);
    handleSearch();
  };

  const handleClearStrategy = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('strategyId');

    router.push(`?${params.toString()}`, { scroll: false });

    form.setFieldValue('strategyId', undefined);
    handleSearch();
  };

  const fetchStrategies = useCallback(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  useEffect(() => {
    form.setFieldValue('strategyId', defaultStrategyId);
  }, [form]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='stock-alert-logs-filter'
        onFinish={handleSearch}
        css={formStyles}
        layout='horizontal'
      >
        <Row gutter={[16, 12]} align='bottom'>
          <Col flex='1'>
            <Form.Item
              css={formItemStyles}
              name='strategyId'
              label={<span css={labelStyles}>{t('strategy')}</span>}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
            >
              <Select
                css={selectStrategyStyles}
                allowClear
                showSearch
                loading={strategyLoading}
                placeholder={t('searchSelectStrategy')}
                optionFilterProp='label'
                options={strategyOptions}
                onSelect={(value) => handleSelectStrategy(value)}
                onClear={handleClearStrategy}
              />
            </Form.Item>
          </Col>
          <Col flex='1'>
            <Form.Item
              css={formItemStyles}
              name='exitDate'
              label={<span css={labelStyles}>{t('exitDate')}</span>}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
            >
              <RangePicker format='MM-DD-YYYY' allowClear />
            </Form.Item>
          </Col>
          <Col flex='1'>
            <Form.Item
              css={formItemStyles}
              name='entryDate'
              label={<span css={labelStyles}>{t('entryDate')}</span>}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 17 }}
            >
              <RangePicker format='MM-DD-YYYY' allowClear />
            </Form.Item>
          </Col>
          <Col css={buttonColStyles}>
            <Form.Item css={formItemStyles}>
              <Button
                htmlType='submit'
                type='primary'
                icon={<SearchOutlined />}
              >
                {t('search')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem 1.6rem;
  display: flex;
  justify-content: flex-end;
`;

const formStyles = css`
  display: flex;
  gap: 1.6rem;
`;

const rowStyles = css`
  /* display: flex;
  flex-wrap: wrap;
  align-items: flex-end; */
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const labelStyles = css`
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.8rem;
`;

const buttonColStyles = css`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  @media (max-width: 1500px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const selectStrategyStyles = css`
  min-width: 27rem;
`;
