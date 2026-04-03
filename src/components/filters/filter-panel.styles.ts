/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const filterPanelStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.015) 100%
  );

  :root[data-theme='light'] & {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(248, 250, 252, 0.96) 100%
    );
    border-color: rgba(15, 23, 42, 0.08);
  }

  :root[data-theme='dark'] & {
    background: linear-gradient(
      180deg,
      rgba(19, 31, 51, 0.92) 0%,
      rgba(15, 24, 40, 0.98) 100%
    );
    border-color: rgba(148, 163, 184, 0.14);
  }
`;
