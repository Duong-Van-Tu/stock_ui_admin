/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Carousel, Card, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCountEarningsCalendar,
  watchEarningsSummary
} from '@/redux/slices/earnings.slice';
import { TimeZone } from '@/constants/timezone';
import 'dayjs/locale/en';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

type EarningsFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: EarningFilter) => void;
};

export const EarningFilter = ({
  customStyles,
  onFilter
}: EarningsFilterProps) => {
  const dispatch = useAppDispatch();
  const earningsSummary = useAppSelector(watchEarningsSummary);
  const [currentWeek, setCurrentWeek] = useState(
    dayjs().tz(TimeZone.NEW_YORK).startOf('isoWeek')
  );

  const getWeekDays = (weekStart: dayjs.Dayjs) =>
    Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));

  const [weekDays, setWeekDays] = useState(() => getWeekDays(currentWeek));

  const fromDate = currentWeek.tz(TimeZone.NEW_YORK).format('YYYY-MM-DD');
  const toDate = currentWeek
    .tz(TimeZone.NEW_YORK)
    .endOf('isoWeek')
    .format('YYYY-MM-DD');

  const [selected, setSelected] = useState<number | null>(() => {
    const todayIndex = weekDays.findIndex((day) =>
      day
        .startOf('day')
        .tz(TimeZone.NEW_YORK)
        .isSame(dayjs().tz(TimeZone.NEW_YORK).startOf('day'), 'day')
    );
    return todayIndex !== -1 ? todayIndex : 0;
  });

  const updateWeek = (newWeek: dayjs.Dayjs) => {
    const newWeekDays = getWeekDays(newWeek);
    setWeekDays(newWeekDays);

    const todayIndex = newWeekDays.findIndex((day) =>
      day.startOf('day').isSame(dayjs().startOf('day'), 'day')
    );
    const index = todayIndex !== -1 ? todayIndex : 0;
    setSelected(index);
    const selectedDate = weekData[index]?.date;
    if (selectedDate) {
      onFilter({
        earningDate: dayjs(selectedDate)
          .tz(TimeZone.NEW_YORK)
          .format('YYYY-MM-DD')
      });
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => {
      const newWeek = prev.subtract(1, 'week');
      updateWeek(newWeek);
      return newWeek;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => {
      const newWeek = prev.add(1, 'week');
      updateWeek(newWeek);
      return newWeek;
    });
  };

  const fetchEarningsSummary = useCallback(() => {
    dispatch(
      getCountEarningsCalendar({
        fromDate,
        toDate
      })
    );
  }, [dispatch, fromDate, toDate]);

  const weekData = weekDays.map((day) => {
    const dayData = earningsSummary.find((item) =>
      day.isSame(dayjs(item.date).tz(TimeZone.NEW_YORK), 'day')
    );
    return { date: day, total: dayData?.total ?? 0 };
  });

  const handleSelectedDate = (index: number) => {
    setSelected(index);

    const selectedDate = weekData[index]?.date;

    if (selectedDate) {
      onFilter({
        earningDate: dayjs(selectedDate)
          .tz(TimeZone.NEW_YORK)
          .format('YYYY-MM-DD')
      });
    }
  };

  useEffect(() => {
    fetchEarningsSummary();
  }, [fetchEarningsSummary]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Tooltip placement='topLeft' title={'Previous'}>
        <Button onClick={handlePreviousWeek} icon={<LeftOutlined />} />
      </Tooltip>

      <div css={scrollContainerStyles}>
        <Carousel dots={false} infinite={false}>
          <div>
            <div
              css={css`
                display: flex;
                gap: 2rem;
              `}
            >
              {weekData.map((item, index) => (
                <Card
                  key={index}
                  css={[cardStyles, selected === index && selectedCardStyles]}
                  onClick={() => handleSelectedDate(index)}
                >
                  <p css={dateTextStyles}>{item.date.format('ddd, MMM DD')}</p>
                  {/* {item.total > 0 && ( */}
                  <Button type='default' css={earningsButtonStyles}>
                    ● {item.total} Earnings
                  </Button>
                  {/* )} */}
                </Card>
              ))}
            </div>
          </div>
        </Carousel>
      </div>
      <Tooltip placement='topLeft' title={'Next'}>
        <Button onClick={handleNextWeek} icon={<RightOutlined />} />
      </Tooltip>
    </div>
  );
};

const rootStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.4rem;
`;

const scrollContainerStyles = css`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  justify-content: start;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const cardStyles = css`
  text-align: center;
  cursor: pointer;
  transition: border 0.3s ease;
  min-width: 15.4rem;
  .ant-card-body {
    padding: 1rem;
    min-width: 14rem;
    min-height: 8.8rem;
  }
`;

const selectedCardStyles = css`
  border: 1px solid #1890ff;
`;

const dateTextStyles = css`
  font-weight: 600;
`;

const earningsButtonStyles = css`
  border-color: #1890ff;
  color: #1890ff;
`;
