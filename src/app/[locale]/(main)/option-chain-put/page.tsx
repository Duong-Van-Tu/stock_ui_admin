'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { OptionChangesTable } from '@/components/tables/options-changes.table';

export default function OptionsChanges() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('optionChainPut');
  }, [t]);

  return <OptionChangesTable optionType='Put' />;
}
