import { Result, Button } from 'antd';
import { useTranslations } from 'next-intl';

type NotFoundSearchResultProps = {
  onReload: () => void;
  title?: string;
};

export const NotFoundSearchResult = ({
  title,
  onReload
}: NotFoundSearchResultProps) => {
  const t = useTranslations();
  return (
    <Result
      status='404'
      title={title}
      extra={
        <Button type='primary' onClick={onReload}>
          {t('reloadData')}
        </Button>
      }
    />
  );
};
