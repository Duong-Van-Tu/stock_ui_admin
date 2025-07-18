import { useState } from 'react';
import { Button } from 'antd';
import { defaultApiFetcher } from '@/utils/api-instances';
import { useNotification } from '@/hooks/notification.hook';
import { useTranslations } from 'next-intl';
import { Icon } from './icons';
import dayjs from 'dayjs';

export const DownloadSymbolTemplateButton = () => {
  const t = useTranslations();
  const { notifySuccess, notifyError } = useNotification();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    const response = await defaultApiFetcher.get(
      'tickers-profile/download-template',
      {
        responseType: 'blob'
      }
    );

    if (response) {
      const fileName = `trade_signals_template_${dayjs().format(
        'MM-DD-YYYY HH_mm_ss'
      )}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      notifySuccess(t('downloadSuccess'));
    } else {
      notifyError(t('downloadError'));
    }
    setDownloading(false);
  };

  return (
    <Button
      onClick={handleDownloadTemplate}
      loading={downloading}
      type='primary'
      icon={
        <Icon
          fill='var(--brand-blue-color)'
          icon='download'
          width={18}
          height={18}
        />
      }
      ghost
    >
      {t('downloadTradeSignalTemplate')}
    </Button>
  );
};
