/** @jsxImportSource @emotion/react */
import { SerializedStyles, css } from '@emotion/react';

import { ReactNode } from 'react';
import { Typography } from 'antd';
import { isMobile } from 'react-device-detect';

const { Title } = Typography;

type TableTitleProps = {
  children?: ReactNode;
  customStyles?: SerializedStyles;
};
export const TableTitle = ({ children, customStyles }: TableTitleProps) => {
  return (
    <Title level={4} css={[titleStyles, customStyles]}>
      {children}
    </Title>
  );
};

const titleStyles = css`
  margin-bottom: 0 !important;
`;
