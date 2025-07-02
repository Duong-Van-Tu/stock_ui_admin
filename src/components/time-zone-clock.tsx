/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Icon } from './icons';
import FloatSelect from './float-select';

dayjs.extend(utc);
dayjs.extend(timezone);

const timeZones = [
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'Central Time (CST)', value: 'America/Chicago' },
  { label: 'Western Time (PST)', value: 'America/Los_Angeles' }
];

export default function TimeZoneClock() {
  const [selectedZone, setSelectedZone] = useState('America/New_York');
  const [time, setTime] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedZone = localStorage.getItem('selectedZone');
    if (savedZone) {
      setSelectedZone(savedZone);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateTime = () => {
      setTime(dayjs().tz(selectedZone).format('HH:mm:ss'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [selectedZone, isClient]);

  const handleChange = (zone?: string) => {
    if (zone) {
      setSelectedZone(zone);
      localStorage.setItem('selectedZone', zone);
    } else {
      setSelectedZone('America/New_York');
      localStorage.setItem('selectedZone', 'America/New_York');
    }
  };

  return (
    <div css={rootStyles}>
      <FloatSelect
        label='Time Zone'
        options={timeZones}
        allowClear
        width='18rem'
        value={selectedZone}
        placeholder=''
        onChange={handleChange}
      />
      <div css={timeContainerStyles}>
        <Icon icon='clock' width={24} height={24} />
        <span css={timeStyles}>{time}</span>
      </div>
    </div>
  );
}

const rootStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;
const timeContainerStyles = css`
  margin-top: 2px;
  display: flex;
  gap: 6px;
  align-items: center;
  width: 10rem;
  span {
    margin-top: 2px;
  }
`;

const timeStyles = css`
  font-size: 1.6rem;
  margin-left: 0.2rem;
`;
