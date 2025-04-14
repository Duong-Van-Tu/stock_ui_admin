/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Drawer } from 'antd';
import { useTranslations } from 'next-intl';
import { NewDetails } from './news-details';
import { EarningsDetails } from './earnings-details';

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
        return `${t('newDetails')} (${symbol})`;
      case ContentType.EARNINGS:
        return `${t('earningsDetail')} (${symbol})`;
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case ContentType.NEWS:
        return <NewDetails symbol={symbol} />;
      case ContentType.EARNINGS:
        return <EarningsDetails symbol={symbol} />;
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
      width={600}
    >
      {renderContent()}
    </Drawer>
  );
};

const drawerStyles = css`
  .ant-drawer-body {
    padding: 1.6rem;
  }
`;
