/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Icon } from './icons';
import FloatSelect from './float-select';
import { Tooltip } from 'antd';
import { useModal } from '@/hooks/modal.hook';

dayjs.extend(utc);
dayjs.extend(timezone);

const timeZones = [
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Central Time (CST)', value: 'America/Chicago' },
  { label: 'Western Time (PST)', value: 'America/Los_Angeles' }
];

export default function TimeZoneClock() {
  const modal = useModal();

  return (
    <Tooltip title='Time zone clock' placement='bottom'>
      <button
        type='button'
        aria-label='Open time zone clock'
        onClick={() =>
          modal.openModal(<TimeZoneClockModalContent />, {
            width: 420,
            centered: true,
            showCloseIcon: false
          })
        }
        css={triggerButtonStyles}
      >
        <Icon icon='clock' width={22} height={22} fill='var(--primary-color)' />
      </button>
    </Tooltip>
  );
}

function TimeZoneClockModalContent() {
  const [selectedZone, setSelectedZone] = useState('America/New_York');
  const [time, setTime] = useState('');

  useEffect(() => {
    const savedZone = localStorage.getItem('selectedZone');
    if (savedZone) {
      setSelectedZone(savedZone);
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setTime(dayjs().tz(selectedZone).format('HH:mm:ss'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [selectedZone]);

  const handleChange = (zone?: string) => {
    const nextZone = zone || 'America/New_York';
    setSelectedZone(nextZone);
    localStorage.setItem('selectedZone', nextZone);
  };

  return (
    <div css={modalContentStyles}>
      <FloatSelect
        label='Time Zone'
        options={timeZones}
        allowClear
        width='100%'
        value={selectedZone}
        placeholder=''
        onChange={handleChange}
      />

      <div css={clockCardStyles}>
        <div css={timeRowStyles}>
          <Icon icon='clock' width={40} height={40} />
          <span css={timeStyles}>{time || '--:--:--'}</span>
        </div>
      </div>
    </div>
  );
}

const triggerButtonStyles = css`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.8rem;
  min-width: 3.8rem;
  height: 3.8rem;
  padding: 0;
  appearance: none;
  border: 1px solid var(--header-chip-border-color);
  border-radius: 50%;
  background: var(--header-chip-background-color);
  box-shadow: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  :root[data-theme='dark'] & {
    box-shadow: none;
  }

  &:hover,
  &:focus-visible {
    border-color: var(--primary-color);
    background: var(--header-chip-hover-background-color);
    outline: none;
  }
`;

const modalContentStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-top: 0.4rem;
`;

const clockCardStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
  min-height: 13rem;
  border: 1px solid var(--border-color);
  border-radius: 1.2rem;
  background: var(--surface-elevated-color);
`;

const timeRowStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
`;

const timeStyles = css`
  font-size: 3.2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
`;
