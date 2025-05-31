/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';

type EllipsisTextProps = {
  text: string;
  maxLines?: number;
};

const EllipsisText = ({ text, maxLines = 2 }: EllipsisTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ellipsisStyle = css`
    display: -webkit-box;
    -webkit-line-clamp: ${maxLines};
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    cursor: pointer;
    word-wrap: break-word;
  `;

  const expandedStyle = css`
    white-space: normal;
    word-wrap: break-word;
    cursor: pointer;
  `;

  return (
    <div
      css={isExpanded ? expandedStyle : ellipsisStyle}
      onClick={() => setIsExpanded(!isExpanded)}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

export default EllipsisText;
