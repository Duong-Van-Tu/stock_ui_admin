/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, Form, Row, Select, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import {
  getATROptions,
  getAvgVolumeOptions,
  getBetaOptions,
  getBooleanOptions
} from '@/utils/stock-filter';
import { parseRangeValue } from '@/utils/common';
import { useAppSelector } from '@/redux/hooks';
import { watchSearchSymbol } from '@/redux/slices/search';
import { SelectFilter } from './select-filter';

type ListHighActivityFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: ListHighActivityFilter) => void;
};

const DEFAULT_AVG_VOLUME = 'o2000000';
const DROP_1_5_PCT = 'true';

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
  const symbol = useAppSelector(watchSearchSymbol);
  const [form] = Form.useForm();

  const avgVolumeOptions = getAvgVolumeOptions(t);

  const atrOptions = getATROptions(t);
  const betaOptions = getBetaOptions(t);

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
    const params = new URLSearchParams(searchParams.toString());
    const avgVolume = params.get('avgVolume') ?? DEFAULT_AVG_VOLUME;
    const atr = params.get('atr') ?? 'any';
    const beta = params.get('beta') ?? 'any';
    const drop1_5Pct = params.get('drop1_5Pct') ?? DROP_1_5_PCT;

    const initialValues = { avgVolume, atr, beta, drop1_5Pct };
    form.setFieldsValue(initialValues);

    onFilter({
      symbol,
      ...buildFilterData(initialValues),
      drop1_5Pct
    });
  }, [searchParams, symbol]);

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
              options={getBooleanOptions(t)}
              onSelect={(value) => updateSearchParams('drop1_5Pct', value)}
              onClear={() => updateSearchParams('drop1_5Pct')}
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

type SelectFilterProps = {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  onClear: () => void;
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
