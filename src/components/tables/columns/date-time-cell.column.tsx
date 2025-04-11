/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TimeZone } from '@/constants/timezone.constant';

type DateTimeCellProps = {
  value: string | number | Date;
};

dayjs.extend(utc);
dayjs.extend(timezone);

export const DateTimeCell = ({ value }: DateTimeCellProps) => {
  const formattedDate = dayjs(value).tz(TimeZone.NEW_YORK).format('MM/DD/YYYY');
  const formattedTime = dayjs(value).tz(TimeZone.NEW_YORK).format('HH:mm');

  return (
    <div css={dateTimeCellStyles}>
      <div>{formattedDate}</div>
      <div>{formattedTime}</div>
    </div>
  );
};

const dateTimeCellStyles = css`
  text-align: center;
`;
