/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Select } from 'antd';
import {
  getIndustries,
  getSectors,
  watchIndustries,
  watchIndustriesLoading,
  watchSectorLoading,
  watchSectors
} from '@/redux/slices/stock-score.slice';

type StockRankingFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: StockScoreFilter) => void;
};

export const StockRankingFilter = ({
  customStyles,
  onFilter
}: StockRankingFilterProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const industriesLoading = useAppSelector(watchIndustriesLoading);
  const industries = useAppSelector(watchIndustries);
  const sectorsLoading = useAppSelector(watchSectorLoading);
  const sectors = useAppSelector(watchSectors);

  const industryOptions = useMemo(
    () =>
      industries?.map((item) => ({
        value: item.industry,
        label: item.industry
      })),
    [industries]
  );

  const sectorOptions = useMemo(
    () =>
      sectors?.map((item) => ({
        value: item.sector,
        label: item.sector
      })),
    [sectors]
  );

  const handleSectorChange = (value: string) => {
    onFilter({ sector: value });
  };

  const handleIndustryChange = (value: string) => {
    const updatedIndustry = value?.includes(' & ')
      ? value.replace(/ & /g, ' @ ')
      : value;
    onFilter({ industry: updatedIndustry });
  };

  const fetchIndustries = useCallback(() => {
    dispatch(getIndustries());
  }, [dispatch]);

  const fetchSectors = useCallback(() => {
    dispatch(getSectors());
  }, [dispatch]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Select
        allowClear
        showSearch
        css={selectStyles}
        loading={sectorsLoading}
        placeholder={t('searchSelectSector')}
        optionFilterProp='label'
        options={sectorOptions}
        onChange={handleSectorChange}
      />
      <Select
        allowClear
        showSearch
        css={selectStyles}
        loading={industriesLoading}
        placeholder={t('searchSelectIndustry')}
        optionFilterProp='label'
        options={industryOptions}
        onChange={handleIndustryChange}
      />
    </div>
  );
};

const rootStyles = css`
  display: flex;
  gap: 1.2rem;
`;

const selectStyles = css`
  min-width: 20rem;
`;
