/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Drawer } from 'antd';
import { useTranslations } from 'next-intl';

enum ContentType {
  NEWS = 'news',
  EARNINGS = 'earnings',
  RECENT = 'recent'
}

type SymbolDetailsDrawerProps = {
  symbol: string;
  visible: boolean;
  contentType: ContentType | null;
  onClose: () => void;
};

export const SymbolDetailsDrawer = ({
  symbol,
  visible,
  contentType,
  onClose
}: SymbolDetailsDrawerProps) => {
  const t = useTranslations();

  const getDrawerTitle = (contentType: ContentType | null) => {
    switch (contentType) {
      case ContentType.NEWS:
        return `${t('newDetail')} (${symbol})`;
      case ContentType.EARNINGS:
        return `${t('earningsDetail')} (${symbol})`;
      case ContentType.RECENT:
        return 'Recent';
      default:
        return 'Default';
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case ContentType.NEWS:
        return <div>NEWS</div>;
      case ContentType.EARNINGS:
        return <div>EARNINGS</div>;
      case ContentType.RECENT:
        return <div>EARNINGS</div>;
      default:
        return null;
    }
  };

  return (
    <Drawer
      css={drawerStyles}
      title={getDrawerTitle(contentType)}
      open={visible}
      onClose={onClose}
      width={400}
    >
      {renderContent()}
    </Drawer>
  );
};

const drawerStyles = css``;
