/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, Form, Row, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import {
  getATROptions,
  getAvgVolumeOptions,
  getBetaOptions,
  getBooleanOptions,
  getRangeDateOptions
} from '@/utils/stock-filter';
import { parseRangeValue } from '@/utils/common';
import { SelectFilter } from './select-filter';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { usePastDateRange } from '@/hooks/date-range.hook';

type ListHighActivityFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: ListHighActivityFilter) => void;
};

const DEFAULT_AVG_VOLUME = 'o2000000';
const DEFAULT_DROP_1_5_PCT = 'true';
const DEFAULT_DATE_RANGE = 3;

const buildFilterData = (fields: Record<string, string>) => ({
  fromVolume: parseRangeValue(fields.avgVolume).from,
  toVolume: parseRangeValue(fields.avgVolume).to,
  fromAtr: parseRangeValue(fields.atr).from,
  toAtr: parseRangeValue(fields.atr).to,
  fromBeta: parseRangeValue(fields.beta).from,
  toBeta: parseRangeValue(fields.beta).to
});

export const ListHighActivityFilter = ({
  customStyles,
  onFilter
}: ListHighActivityFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const params = new URLSearchParams(searchParams.toString());
  const dateRange = Number(params.get('dateRange') ?? DEFAULT_DATE_RANGE);

  const { fromDate, toDate } = usePastDateRange(dateRange);

  const avgVolumeOptions = getAvgVolumeOptions(t);
  const atrOptions = getATROptions(t);
  const betaOptions = getBetaOptions(t);
  const booleanOptions = getBooleanOptions(t);
  const rangeDateOptions = getRangeDateOptions(t);

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilter(buildFilterData(values));
  };

  const handleClearFilters = () => {
    form.resetFields();
    router.push('?', { scroll: false });
  };

  useEffect(() => {
    const avgVolume = params.get('avgVolume') ?? DEFAULT_AVG_VOLUME;
    const atr = params.get('atr') ?? 'any';
    const beta = params.get('beta') ?? 'any';
    const drop1_5Pct = params.get('drop1_5Pct') ?? DEFAULT_DROP_1_5_PCT;
    const rangeDate = params.get('rangeDate')
      ? Number(params.get('rangeDate'))
      : DEFAULT_DATE_RANGE;
    const initialValues = { avgVolume, atr, beta, drop1_5Pct };
    form.setFieldsValue({ ...initialValues, drop1_5Pct, rangeDate });

    onFilter({
      ...buildFilterData(initialValues),
      [fieldMapping.drop1_5Pct]: drop1_5Pct,
      fromDate,
      toDate
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form, onFilter, fromDate, toDate]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='list-high-activity'
        onFinish={handleSearch}
        css={formStyles}
        layout='horizontal'
      >
        <Row gutter={[16, 12]} align='bottom' justify='end'>
          <Col>
            <SelectFilter
              name='avgVolume'
              label={t('avgVolume')}
              options={avgVolumeOptions}
              onSelect={(value) => updateSearchParams('avgVolume', value)}
              onClear={() => updateSearchParams('avgVolume')}
            />
          </Col>
          <Col>
            <SelectFilter
              name='atr'
              label={t('atr')}
              options={atrOptions}
              onSelect={(value) => updateSearchParams('atr', value)}
              onClear={() => updateSearchParams('atr')}
            />
          </Col>
          <Col>
            <SelectFilter
              name='beta'
              label={t('beta')}
              options={betaOptions}
              onSelect={(value) => updateSearchParams('beta', value)}
              onClear={() => updateSearchParams('beta')}
            />
          </Col>
          <Col>
            <SelectFilter
              name='drop1_5Pct'
              label={t('drop1_5Pct')}
              options={booleanOptions}
              onSelect={(value) => updateSearchParams('drop1_5Pct', value)}
              onClear={() => updateSearchParams('drop1_5Pct')}
            />
          </Col>
          <Col>
            <SelectFilter
              name='rangeDate'
              options={rangeDateOptions.map((option) => ({
                label: option.label,
                value: String(option.value)
              }))}
              onSelect={(value) => updateSearchParams('rangeDate', value)}
              onClear={() => updateSearchParams('rangeDate')}
            />
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
  justify-content: flex-end;
  gap: 1.6rem;
`;
