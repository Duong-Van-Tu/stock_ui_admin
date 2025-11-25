/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useRef } from 'react';
import { Drawer, Checkbox, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { useTranslations } from 'next-intl';
import { useLocalStorage } from '@/hooks/local-storage.hook';

type SetColumnProps = {
  visible: boolean;
  columns: TableColumnsType<any>;
  visibleColumns: string[];
  onChange: (checkedValues: string[]) => void;
  onClose: () => void;
  width?: number | string;
  storageKey: string;
};

export const SetColumn = ({
  visible,
  columns,
  visibleColumns,
  storageKey,
  onChange,
  onClose,
  width = 360
}: SetColumnProps) => {
  const t = useTranslations();

  const defaultVisibleRef = useRef<string[]>(
    visibleColumns.map((k) => String(k))
  );
  const defaultVisible = defaultVisibleRef.current;

  const { value: storedVisible, setValue: setStoredVisible } = useLocalStorage<
    string[]
  >(storageKey, defaultVisible);

  const localVisible: string[] = Array.isArray(storedVisible)
    ? storedVisible
    : defaultVisible;

  const handleChange = (vals: (string | number)[]) => {
    const checked = vals.map(String);
    setStoredVisible(checked);
    onChange(checked);
  };

  const handleReset = () => {
    const allKeys = columns.map((col) => String(col.key));
    setStoredVisible(allKeys);
    onChange(allKeys);
  };

  return (
    <Drawer
      title={t('setColumn')}
      placement='right'
      onClose={onClose}
      open={visible}
      width={width}
      extra={
        <Button ghost type='primary' onClick={handleReset}>
          {t('reset')}
        </Button>
      }
      css={drawerStyles}
    >
      <Checkbox.Group
        options={columns.map((col) => ({
          label: typeof col.title === 'function' ? col.title({}) : col.title,
          value: String(col.key)
        }))}
        value={localVisible}
        onChange={(vals) => handleChange(vals as string[])}
      />
    </Drawer>
  );
};

const drawerStyles = css`
  .ant-drawer-header {
    padding: 1.4rem;
  }
  .ant-drawer-body {
    padding: 1.4rem 2rem;
  }
  .ant-checkbox-group {
    flex-direction: column;
    gap: 0.4rem;
  }
`;
