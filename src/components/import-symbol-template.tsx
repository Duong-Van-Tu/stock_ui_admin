/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ChangeEvent, useRef, useState } from 'react';
import { Button } from 'antd';
import { defaultApiFetcher } from '@/utils/api-instances';
import { useNotification } from '@/hooks/notification.hook';
import { useTranslations } from 'next-intl';
import { Icon } from './icons';

type ImportSymbolButtonProps = {
  url: string;
  onSuccess?: () => void | Promise<void>;
  appendFormData?: (formData: FormData, file: File) => void;
  buttonText?: string;
  size?: 'large' | 'middle' | 'small';
  hideIcon?: boolean;
};

export const ImportSymbolButton = ({
  url,
  onSuccess,
  appendFormData,
  buttonText,
  size = 'middle',
  hideIcon = false
}: ImportSymbolButtonProps) => {
  const t = useTranslations();
  const { notifySuccess, notifyError } = useNotification();
  const inputImportRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState<boolean>(false);

  const handleImportSymbol = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setImporting(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    appendFormData?.(formData, file);

    try {
      const response = await defaultApiFetcher.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response) {
        notifySuccess(t('importSuccess'));
        await onSuccess?.();
      } else {
        notifyError(t('importError'));
      }
    } catch {
      notifyError(t('importError'));
    } finally {
      setImporting(false);
      if (inputImportRef.current) inputImportRef.current.value = '';
    }
  };

  return (
    <Button
      type='primary'
      css={importUserBtnStyles}
      size={size}
      loading={importing}
      icon={
        hideIcon ? undefined : (
          <Icon
            fill='var(--white-color)'
            icon='upload'
            width={18}
            height={18}
          />
        )
      }
      onClick={() => inputImportRef.current?.click()}
    >
      {buttonText || t('importExcel')}
      <input
        ref={inputImportRef}
        type='file'
        hidden
        accept='.xlsx,.xls'
        onChange={handleImportSymbol}
      />
    </Button>
  );
};

const importUserBtnStyles = css`
  background: var(--electric-indigo-color);
  &:hover {
    background: var(--electric-indigo-color) !important;
    opacity: 0.9;
  }
`;
