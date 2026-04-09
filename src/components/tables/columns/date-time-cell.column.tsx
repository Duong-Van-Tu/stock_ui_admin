/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';

type DateTimeCellProps = {
  value: string | number | Date;
  showTime?: boolean;
  convertTimeZone?: boolean;
  useUTC?: boolean;
};

export const DateTimeCell = ({
  value,
  showTime = true,
  convertTimeZone = true,
  useUTC = false
}: DateTimeCellProps) => {
  const date = convertTimeZone
    ? dayjs(value).tz(TimeZone.NEW_YORK)
    : useUTC
      ? dayjs(value).utc()
      : dayjs(value);

  const formattedDate = date.format('MM/DD/YYYY');
  const formattedTime = date.format('HH:mm');

  return (
    <div css={dateTimeCellStyles}>
      <div>{formattedDate}</div>
      {showTime && <div>{formattedTime}</div>}
    </div>
  );
};

const dateTimeCellStyles = css`
  text-align: center;
`;
