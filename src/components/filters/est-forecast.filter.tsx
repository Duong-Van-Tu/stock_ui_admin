/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { Card, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCountEstForecast,
  watchEstForecastSummary
} from '@/redux/slices/est-forecast.slice';
import { useLocale, useTranslations } from 'next-intl';
import { isMobile } from 'react-device-detect';

type EstForecastFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: { startDate: string; endDate: string }) => void;
  selectedDate?: string;
};

export const EstForecastFilter = ({
  customStyles,
  onFilter,
  selectedDate
}: EstForecastFilterProps) => {
  const t = useTranslations();
  const locale = useLocale() || 'en';
  const dispatch = useAppDispatch();

  const estForecastSummary = useAppSelector(watchEstForecastSummary);

  const [currentWeek, setCurrentWeek] = useState(() =>
    dayjs().startOf('isoWeek')
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) =>
      currentWeek.add(i, 'day').startOf('day')
    );
  }, [currentWeek]);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selected, setSelected] = useState(() => {
    const todayIndex = weekDays.findIndex((day) =>
      day.startOf('day').isSame(dayjs().startOf('day'), 'day')
    );
    return todayIndex !== -1 ? todayIndex : 0;
  });

  const normalizedSummary = useMemo(() => {
    return estForecastSummary.map((item) => ({
      date: dayjs.utc(item.date).startOf('day').format('YYYY-MM-DD'),
      total: item.total
    }));
  }, [estForecastSummary]);

  const weekData = useMemo(() => {
    return weekDays.map((day) => {
      const formattedDay = day.format('YYYY-MM-DD');
      const itemData = normalizedSummary.find(
        (item) => item.date === formattedDay
      );
      return { date: day, total: itemData?.total ?? 0 };
    });
  }, [normalizedSummary, weekDays]);

  const handleSelectedDate = (index: number) => {
    setSelected(index);
    const selectedDate = weekData[index].date.format('YYYY-MM-DD');
    onFilter({ startDate: selectedDate, endDate: selectedDate });

    itemRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  const fetchEstForecastSummary = useCallback(() => {
    const fromDate = currentWeek.format('YYYY-MM-DD');
    const toDate = currentWeek.endOf('isoWeek').format('YYYY-MM-DD');

    dispatch(
      getCountEstForecast({
        fromDate,
        toDate
      })
    );
  }, [dispatch, currentWeek]);

  const updateWeek = (newWeek: dayjs.Dayjs) => {
    setCurrentWeek(newWeek);
    setSelected(0);

    const firstDayOfWeek = newWeek.startOf('isoWeek').format('YYYY-MM-DD');
    onFilter({ startDate: firstDayOfWeek, endDate: firstDayOfWeek });

    setTimeout(() => {
      itemRefs.current[0]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest'
      });
    }, 100);
  };

  useEffect(() => {
    fetchEstForecastSummary();
  }, [fetchEstForecastSummary]);

  useEffect(() => {
    if (selectedDate) {
      const selectedDay = dayjs(selectedDate);
      if (
        selectedDay.isAfter(currentWeek.subtract(1, 'day')) &&
        selectedDay.isBefore(currentWeek.endOf('isoWeek').add(1, 'day'))
      ) {
        const index = weekDays.findIndex((day) =>
          day.startOf('day').isSame(selectedDay.startOf('day'), 'day')
        );
        if (index !== -1) {
          setSelected(index);
        }
      } else {
        const newWeek = selectedDay.startOf('isoWeek');
        setCurrentWeek(newWeek);
        setSelected(0);
      }
    }
  }, [selectedDate, currentWeek, weekDays]);

  useEffect(() => {
    setTimeout(() => {
      itemRefs.current[selected]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }, 100);
  }, [weekData, selected]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Tooltip placement='top' title={isMobile ? null : t('previousWeek')}>
        <Button
          size={isMobile ? 'small' : 'middle'}
          shape='circle'
          onClick={() => updateWeek(currentWeek.subtract(1, 'week'))}
          icon={<LeftOutlined />}
          css={prevBtnStyles}
        />
      </Tooltip>

      <div css={scrollContainerStyles}>
        <div css={carouselInnerStyles}>
          {weekData.map((item, index) => (
            <div
              key={item.date.toString()}
              css={[cardWrapperStyles]}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            >
              <Card
                css={[
                  cardStyles,
                  selected === index && selectedCardWrapperStyles
                ]}
                onClick={() => handleSelectedDate(index)}
              >
                <p css={dateTextStyles}>
                  {item.date.locale(locale).format('ddd, MMM DD')}
                </p>
                <Button type='default' css={estForecastButtonStyles}>
                  ● {item.total} {t('earnings')}
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Tooltip placement='top' title={isMobile ? null : t('nextWeek')}>
        <Button
          css={nextBtnStyles}
          size={isMobile ? 'small' : 'middle'}
          shape='circle'
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
`;

const scrollContainerStyles = css`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const carouselInnerStyles = css`
  display: flex;
  gap: 1.2rem;
`;

const cardWrapperStyles = css`
  flex-shrink: 0;
`;

const selectedCardWrapperStyles = css`
  border: 1px solid var(--blue-500);
  background: var(--blue-100);
`;

const cardStyles = css`
  text-align: center;
  cursor: pointer;
  transition: border 0.3s ease;
  min-width: 15.4rem;
  .ant-card-body {
    padding: 1.2rem 1rem;
    min-height: 8.8rem;
  }
`;

const dateTextStyles = css`
  font-weight: 600;
  margin-bottom: 0.8rem;
`;

const estForecastButtonStyles = css`
  border-color: var(--blue-500);
  color: var(--blue-500);
  background-color: var(--white-color);
`;

const prevBtnStyles = css`
  margin-right: 0.6rem;
`;

const nextBtnStyles = css`
  margin-left: 0.6rem;
`;
