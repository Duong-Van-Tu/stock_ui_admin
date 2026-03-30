/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useEffect, useMemo } from 'react';
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
import { isMobile } from 'react-device-detect';

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

  useEffect(() => {
    dispatch(getIndustries());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSectors());
  }, [dispatch]);

  return (
    <div css={[rootStyles, customStyles]}>
      <div css={selectContainerStyles}>
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
      </div>
      <div css={selectContainerStyles}>
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
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-wrap: ${isMobile ? 'no-wrap' : 'wrap'};
  gap: 1.2rem;
  justify-content: ${isMobile ? 'flex-end' : 'unset'};
  width: ${isMobile ? '100%' : 'unset'};
`;

const selectStyles = css`
  min-width: ${isMobile ? '100%' : '20rem'};
  max-width: ${isMobile ? '14rem' : '20rem'};
  width: ${isMobile ? '100%' : 'unset'};

  .ant-select-selector {
    border: 1px solid
      color-mix(
        in srgb,
        var(--brand-blue-color) 14%,
        var(--border-light-color)
      ) !important;
    transition: border-color 0.2s ease !important;
  }

  .ant-select-selection-placeholder {
    color: color-mix(
      in srgb,
      var(--text-secondary-color) 82%,
      var(--text-color)
    ) !important;
    font-weight: 400;
  }

  &:hover .ant-select-selector {
    border-color: color-mix(
      in srgb,
      var(--brand-blue-color) 24%,
      var(--border-light-color)
    ) !important;
  }

  &.ant-select-focused .ant-select-selector,
  &.ant-select-open .ant-select-selector {
    border-color: var(--brand-blue-color) !important;
  }
`;

const selectContainerStyles = css`
  width: ${isMobile ? '50%' : 'unset'};
`;
