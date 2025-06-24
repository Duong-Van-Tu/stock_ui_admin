/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, DatePicker, Form, Row, Select, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStrategies,
  watchStrategies,
  watchStrategyLoading
} from '@/redux/slices/signals.slice';
import { isMobile } from 'react-device-detect';

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
      fromEntryDate: values.entryDate?.[0]?.format('YYYY-MM-DD'),
      toEntryDate: values.entryDate?.[1]?.format('YYYY-MM-DD'),
      fromExitDate: values.exitDate?.[0]?.format('YYYY-MM-DD'),
      toExitDate: values.exitDate?.[1]?.format('YYYY-MM-DD'),
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

  useEffect(() => {
    dispatch(getStrategies());
  }, [dispatch]);

  useEffect(() => {
    if (defaultStrategyId) {
      form.setFieldValue('strategyId', defaultStrategyId);
    }
  }, [form, defaultStrategyId]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='stock-alert-logs-filter'
        onFinish={handleSearch}
        labelCol={{ span: isMobile ? 3 : undefined }}
        css={formStyles}
        layout='horizontal'
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
      </Form>
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem 1.6rem;
`;

const formStyles = css`
  display: flex;
  justify-content: ${isMobile ? 'center' : 'flex-end'};
  gap: 1.6rem;
  .ant-form-item-label {
    padding-bottom: 0;
  }
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const labelStyles = css`
  font-size: 1.4rem;
  font-weight: 600;
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
