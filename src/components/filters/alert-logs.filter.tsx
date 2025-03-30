/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Button, Col, DatePicker, Form, Row, Select, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
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

  const handleClearFilters = () => {
    form.resetFields();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('strategyId');

    router.push(`?${params.toString()}`, { scroll: false });

    onFilter({
      fromEntryDate: undefined,
      toEntryDate: undefined,
      fromExitDate: undefined,
      toExitDate: undefined,
      strategyId: undefined
    });
  };

  const handleSelectStrategy = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('strategyId', value.toString());

    router.push(`?${params.toString()}`, { scroll: false });
    form.setFieldValue('strategyId', value);
  };

  const handleClearStrategy = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('strategyId');

    router.push(`?${params.toString()}`, { scroll: false });

    form.setFieldValue('strategyId', undefined);
  };

  const fetchStrategies = useCallback(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  useEffect(() => {
    form.setFieldValue('strategyId', defaultStrategyId);
  }, [form, defaultStrategyId]);

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
          <Col>
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
                onSelect={(value) => handleSelectStrategy(value)}
                onClear={handleClearStrategy}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              css={formItemStyles}
              name='exitDate'
              label={<span css={labelStyles}>{t('exitDate')}</span>}
            >
              <RangePicker format='MM-DD-YYYY' allowClear />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              css={formItemStyles}
              name='entryDate'
              label={<span css={labelStyles}>{t('entryDate')}</span>}
            >
              <RangePicker format='MM-DD-YYYY' allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Space size='small' css={actionStyles}>
          <Button htmlType='submit' type='primary' icon={<SearchOutlined />}>
            {t('search')}
          </Button>
          <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
            {t('clear')}
          </Button>
        </Space>
      </Form>
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem 1.6rem;
  display: flex;
  @media (max-width: 1615px) {
    justify-content: flex-end;
  }
`;

const formStyles = css`
  display: flex;
  gap: 1.6rem;
  @media (max-width: 1615px) {
    display: block;
  }

  @media (max-width: 1401px) {
    display: flex;
  }
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const labelStyles = css`
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.8rem;
`;

const selectStrategyStyles = css`
  min-width: 24rem;
`;

const actionStyles = css`
  @media (max-width: 1615px) {
    width: 100%;
    margin-top: 1.6rem;
    justify-content: flex-end;
  }

  @media (max-width: 1401px) {
    width: auto;
  }
`;
