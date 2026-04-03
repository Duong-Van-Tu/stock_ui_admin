/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, Form, Row, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { SelectFilter } from './select-filter';
import { filterPanelStyles } from './filter-panel.styles';
import { getMarketCapOptions, getPeriodOptions } from '@/utils/stock-filter';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getIndustriesV2,
  getSectorsV2,
  watchIndustries,
  watchSectors
} from '@/redux/slices/stock-score.slice';
import { parseRangeValue } from '@/utils/common';
import { isMobile } from 'react-device-detect';

type WatchlistSwingTradeFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: WatchlistSwingTradeFilter) => void;
};

const DEFAULT_PERIOD = '1day';

export const WatchlistSwingTradeFilter = ({
  customStyles,
  onFilter
}: WatchlistSwingTradeFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const prevSectorRef = useRef<string | null>(null);
  const industries = useAppSelector(watchIndustries);
  const sectors = useAppSelector(watchSectors);

  const selectedSector = params.get('sector');

  const periodOptions = getPeriodOptions(t);
  const marketCapOptions = getMarketCapOptions(t);
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

  const updateSearchParams = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(key, value) : params.delete(key);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilter(values);
  };

  const handleClearFilters = () => {
    form.resetFields();
    form.setFieldValue('period', '');
    form.setFieldValue('marketCap', '');
    form.setFieldValue('sector', '');
    form.setFieldValue('industry', '');
    onFilter({ period: DEFAULT_PERIOD });
    router.push('?', { scroll: false });
  };

  useEffect(() => {
    const period = params.get('period') ?? DEFAULT_PERIOD;
    const marketCap = params.get('marketCap') ?? '';
    const industry = params.get('industry') ?? '';
    const sector = params.get('sector') ?? '';
    const initialValues = { period, industry, sector, marketCap };
    form.setFieldsValue({ ...initialValues });
    const hasSector = !!sector;
    const hasIndustry = !!industry;

    if (hasSector || (!hasSector && !hasIndustry)) {
      onFilter({
        period: period!,
        sector,
        industry: industry?.includes(' & ')
          ? industry.replace(/ & /g, ' @ ')
          : industry,
        fromMarketCap: parseRangeValue(marketCap).from,
        toMarketCap: parseRangeValue(marketCap).to
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form, onFilter]);

  useEffect(() => {
    dispatch(getSectorsV2());
  }, [dispatch]);

  useEffect(() => {
    const prevSector = prevSectorRef.current;

    if (selectedSector !== prevSector) {
      form.setFieldsValue({ industry: '' });
      updateSearchParams('industry', '');

      if (selectedSector) {
        dispatch(getIndustriesV2(selectedSector));
      }
    }

    prevSectorRef.current = selectedSector;
  }, [selectedSector, form, dispatch, updateSearchParams]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='list-high-activity'
        onFinish={handleSearch}
        css={formStyles}
        layout='horizontal'
      >
        <Row
          gutter={isMobile ? [16, 16] : [16, 12]}
          align='bottom'
          justify='end'
        >
          <Col>
            <SelectFilter
              name='period'
              label={t('period')}
              options={periodOptions}
              onSelect={(value) => updateSearchParams('period', value)}
              onClear={() => updateSearchParams('period')}
              width='11rem'
              value={form.getFieldValue('period') ?? ''}
              labelFloating
            />
          </Col>
          <Col>
            <SelectFilter
              name='marketCap'
              label={t('marketCap')}
              options={marketCapOptions}
              onSelect={(value) => updateSearchParams('marketCap', value)}
              onClear={() => updateSearchParams('marketCap')}
              value={form.getFieldValue('marketCap')}
              labelFloating
            />
          </Col>
          <Col>
            <SelectFilter
              name='sector'
              label={t('sector')}
              options={sectorOptions}
              onSelect={(value) => updateSearchParams('sector', value)}
              onClear={() => updateSearchParams('sector')}
              width={isMobile ? '15.4rem' : '20rem'}
              value={form.getFieldValue('sector') ?? ''}
              labelFloating
            />
          </Col>
          <Col>
            <SelectFilter
              name='industry'
              label={t('industry')}
              options={industryOptions}
              onSelect={(value) => updateSearchParams('industry', value)}
              onClear={() => updateSearchParams('industry')}
              width={isMobile ? '15.4rem' : '20rem'}
              labelFloating
              value={form.getFieldValue('industry') ?? ''}
              disabled={!form.getFieldValue('sector')}
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
  ${filterPanelStyles};
  padding: 1.4rem 1.6rem;
`;

const formStyles = css`
  display: flex;
  justify-content: flex-end;
`;
