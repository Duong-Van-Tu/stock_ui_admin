/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ChangeEvent, CSSProperties, useRef, useState } from 'react';
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
  width?: number | string;
  buttonType?: 'primary' | 'default';
};

export const ImportSymbolButton = ({
  url,
  onSuccess,
  appendFormData,
  buttonText,
  size = 'middle',
  hideIcon = false,
  width,
  buttonType = 'primary'
}: ImportSymbolButtonProps) => {
  const t = useTranslations();
  const { notifySuccess, notifyError } = useNotification();
  const inputImportRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const isPrimaryButton = buttonType === 'primary';
  const buttonLabelColor = isPrimaryButton
    ? 'var(--white-color)'
    : 'var(--electric-indigo-color)';
  const buttonStyle: CSSProperties = {
    ...(width ? { width } : {}),
    color: buttonLabelColor,
    WebkitTextFillColor: buttonLabelColor,
    borderColor: 'var(--electric-indigo-color)',
    ...(isPrimaryButton ? { background: 'var(--electric-indigo-color)' } : {})
  };

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
      className={`import-symbol-button import-symbol-button--${buttonType}`}
      type={buttonType}
      css={isPrimaryButton ? importUserBtnStyles : importOutlineBtnStyles}
      size={size}
      style={buttonStyle}
      loading={importing}
      icon={
        hideIcon ? undefined : (
          <Icon fill={buttonLabelColor} icon='upload' width={18} height={18} />
        )
      }
      onClick={() => inputImportRef.current?.click()}
    >
      <span
        className='import-symbol-button__label'
        style={{
          color: buttonLabelColor,
          WebkitTextFillColor: buttonLabelColor
        }}
      >
        {buttonText || t('importExcel')}
      </span>
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
  && {
    background: var(--electric-indigo-color);
    color: var(--white-color);
    -webkit-text-fill-color: var(--white-color);
    border-color: var(--electric-indigo-color);
  }

  && .import-symbol-button__label {
    color: var(--white-color) !important;
    -webkit-text-fill-color: var(--white-color) !important;
  }

  &:hover {
    background: var(--electric-indigo-color) !important;
    opacity: 0.9;
  }
`;

const importOutlineBtnStyles = css`
  && {
    color: var(--electric-indigo-color) !important;
    -webkit-text-fill-color: var(--electric-indigo-color) !important;
    border-color: var(--electric-indigo-color) !important;
  }

  && .import-symbol-button__label {
    color: var(--electric-indigo-color) !important;
    -webkit-text-fill-color: var(--electric-indigo-color) !important;
  }

  &:hover,
  &:focus {
    color: var(--electric-indigo-color) !important;
    -webkit-text-fill-color: var(--electric-indigo-color) !important;
    border-color: var(--electric-indigo-color) !important;
    background: rgba(93, 56, 245, 0.04) !important;
  }
`;
