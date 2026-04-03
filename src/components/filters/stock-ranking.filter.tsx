/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getIndustries,
  getSectors,
  watchIndustries,
  watchIndustriesLoading,
  watchSectorLoading,
  watchSectors
} from '@/redux/slices/stock-score.slice';
import { isMobile } from 'react-device-detect';
import FloatSelect from '@/components/float-select';
import { filterPanelStyles } from './filter-panel.styles';

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
        <FloatSelect
          label={t('sector')}
          width={isMobile ? '100%' : '20rem'}
          allowClear
          showSearch
          loading={sectorsLoading}
          placeholder={t('searchSelectSector')}
          optionFilterProp='label'
          options={sectorOptions}
          onChange={handleSectorChange}
        />
      </div>
      <div css={selectContainerStyles}>
        <FloatSelect
          label={t('industry')}
          width={isMobile ? '100%' : '20rem'}
          allowClear
          showSearch
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
  ${filterPanelStyles};
  display: flex;
  flex-wrap: ${isMobile ? 'no-wrap' : 'wrap'};
  gap: 1.2rem;
  justify-content: ${isMobile ? 'flex-end' : 'unset'};
  width: ${isMobile ? '100%' : 'unset'};
`;

const selectContainerStyles = css`
  width: ${isMobile ? '50%' : 'unset'};
`;
