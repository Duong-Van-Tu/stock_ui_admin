/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Carousel, Card, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCountEarningsCalendar,
  watchEarningsSummary
} from '@/redux/slices/earnings.slice';
import { useLocale, useTimeZone, useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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
  const t = useTranslations();
  const timezone = useTimeZone() || TimeZone.NEW_YORK;
  const locale = useLocale() || 'en';
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDateFromURL = searchParams.get('selectedDate');

  const earningsSummary = useAppSelector(watchEarningsSummary);

  const [currentWeek, setCurrentWeek] = useState(() =>
    dayjs().tz(timezone).startOf('isoWeek')
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      currentWeek.tz(timezone).add(i, 'day').startOf('day')
    );
  }, [currentWeek]);

  const [selected, setSelected] = useState(() => {
    if (selectedDateFromURL) {
      const urlIndex = weekDays.findIndex(
        (day) => day.format('YYYY-MM-DD') === selectedDateFromURL
      );
      return urlIndex !== -1 ? urlIndex : 0;
    }

    const todayIndex = weekDays.findIndex((day) =>
      day.startOf('day').isSame(dayjs().tz(timezone).startOf('day'), 'day')
    );
    return todayIndex !== -1 ? todayIndex : 0;
  });

  const weekData = useMemo(() => {
    return weekDays.map((day) => {
      const itemData = earningsSummary.find((item) =>
        day.isSame(dayjs(item.date).tz(timezone).startOf('day'), 'day')
      );
      return { date: day, total: itemData?.total ?? 0 };
    });
  }, [earningsSummary, weekDays]);

  const handleSelectedDate = (index: number) => {
    setSelected(index);
    const selectedDate = weekData[index].date.format('YYYY-MM-DD');
    onFilter({ date: selectedDate });

    const params = new URLSearchParams(searchParams.toString());
    params.set('selectedDate', selectedDate);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchEarningsSummary = useCallback(() => {
    const fromDate = currentWeek.tz(timezone).format('YYYY-MM-DD');
    const toDate = currentWeek
      .tz(timezone)
      .endOf('isoWeek')
      .format('YYYY-MM-DD');

    dispatch(
      getCountEarningsCalendar({
        fromDate,
        toDate
      })
    );
  }, [dispatch, currentWeek]);

  const updateWeek = (newWeek: dayjs.Dayjs) => {
    setCurrentWeek(newWeek);
    setSelected(0);

    const firstDayOfWeek = newWeek.startOf('isoWeek').format('YYYY-MM-DD');
    onFilter({ date: firstDayOfWeek });

    const params = new URLSearchParams(searchParams.toString());
    params.set('selectedDate', firstDayOfWeek);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchEarningsSummary();
  }, [fetchEarningsSummary]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Tooltip placement='topLeft' title='Previous'>
        <Button
          onClick={() => updateWeek(currentWeek.subtract(1, 'week'))}
          icon={<LeftOutlined />}
        />
      </Tooltip>

      <div css={scrollContainerStyles}>
        <Carousel dots={false} infinite={false}>
          <div>
            <div css={carouselInnerStyles}>
              {weekData.map((item, index) => (
                <Card
                  key={item.date.toString()}
                  css={[cardStyles, selected === index && selectedCardStyles]}
                  onClick={() => handleSelectedDate(index)}
                >
                  <p css={dateTextStyles}>
                    {item.date.locale(locale).format('ddd, MMM DD')}
                  </p>
                  <Button type='default' css={earningsButtonStyles}>
                    ● {item.total} {t('earnings')}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </Carousel>
      </div>

      <Tooltip placement='topLeft' title='Next'>
        <Button
          onClick={() => updateWeek(currentWeek.add(1, 'week'))}
          icon={<RightOutlined />}
        />
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
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const carouselInnerStyles = css`
  display: flex;
  gap: 2rem;
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
