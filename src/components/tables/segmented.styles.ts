/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { isMobile } from 'react-device-detect';

type SegmentedLabelStyleOptions = {
  minWidth?: string;
  textTransform?: 'none' | 'uppercase';
};

export const segmentedContainerStyles = css`
  display: flex;
  justify-content: center;
  min-width: 0;
`;

export const segmentedStyles = css`
  && {
    padding: 0.4rem;
    border-radius: 1.4rem;
    background: #f3f6fa;
    border: 1px solid rgba(8, 127, 244, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .ant-segmented-group {
    gap: 0.4rem;
  }

  .ant-segmented-item {
    border-radius: 1rem;
    color: rgba(0, 0, 0, 0.55);
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  .ant-segmented-item:hover {
    color: rgba(0, 0, 0, 0.88);
  }

  .ant-segmented-item-selected {
    background: linear-gradient(135deg, #1677ff 0%, #0b8cff 100%);
    color: var(--white-color);
    box-shadow: 0 8px 18px rgba(8, 127, 244, 0.22);
  }

  .ant-segmented-item-selected:hover {
    color: var(--white-color);
  }

  .ant-segmented-thumb {
    border-radius: 1rem;
    box-shadow: 0 8px 18px rgba(8, 127, 244, 0.18);
  }

  [data-theme='dark'] && {
    background: linear-gradient(
      180deg,
      rgba(20, 28, 40, 0.98) 0%,
      rgba(17, 27, 46, 0.98) 100%
    ) !important;
    border: 1px solid rgba(148, 163, 184, 0.22) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.04),
      0 10px 24px rgba(0, 0, 0, 0.22) !important;

    .ant-segmented-item {
      color: var(--text-secondary-color) !important;
    }

    .ant-segmented-item:hover {
      color: var(--text-color) !important;
      background: rgba(148, 163, 184, 0.12);
    }

    .ant-segmented-item-selected {
      background: linear-gradient(135deg, #1677ff 0%, #36a3ff 100%) !important;
      color: var(--white-color) !important;
      box-shadow:
        0 10px 24px rgba(8, 127, 244, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
    }

    .ant-segmented-item-selected:hover {
      color: var(--white-color) !important;
    }

    .ant-segmented-thumb {
      background: linear-gradient(135deg, #1677ff 0%, #36a3ff 100%) !important;
      box-shadow:
        0 10px 24px rgba(8, 127, 244, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    }
  }
`;

export const createSegmentedLabelStyles = ({
  minWidth = isMobile ? '7.4rem' : '8.8rem',
  textTransform = 'none'
}: SegmentedLabelStyleOptions = {}) => css`
  min-width: ${minWidth};
  padding: ${isMobile ? '0.8rem 1rem' : '0.9rem 1.4rem'};
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
  text-transform: ${textTransform};
`;
