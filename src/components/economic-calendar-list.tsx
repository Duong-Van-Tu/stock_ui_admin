'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Popover, List, Badge, Typography, Spin, Tag, Tooltip } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getEconomicCalendar,
  watchEconomicCalendar,
  watchEconomicLoading
} from '@/redux/slices/earnings.slice';
import dayjs from 'dayjs';
import { Icon } from './icons';
import { TimeZone } from '@/constants/timezone.constant';

const { Text } = Typography;

export const EconomicCalendarList = () => {
  const dispatch = useAppDispatch();
  const events: EconomicCalendar[] = useAppSelector(watchEconomicCalendar);
  const loading = useAppSelector(watchEconomicLoading);

  const [newEventsCount, setNewEventsCount] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const prevEventsRef = useRef<EconomicCalendar[]>([]);

  const fetchData = useCallback(async () => {
    await dispatch(getEconomicCalendar({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (events && events.length > 0) {
      if (isFirstLoad.current) {
        setNewEventsCount(0);
        isFirstLoad.current = false;
      } else if (prevEventsRef.current.length > 0) {
        const prevIds = new Set(prevEventsRef.current.map((e) => e.id));
        const newItems = events.filter((e) => !prevIds.has(e.id));
        if (newItems.length > 0) {
          setNewEventsCount((prev) => prev + newItems.length);
        }
      }
      prevEventsRef.current = events;
    }
  }, [events]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toUpperCase()) {
      case 'HIGH':
        return 'var(--danger-soft-color)';
      case 'MEDIUM':
        return 'var(--yellow-color)';
      default:
        return 'var(--success-color)';
    }
  };

  const content = (
    <div css={popoverContentStyles}>
      <div css={headerStyles}>
        <Text
          strong
          style={{
            fontSize: '1.5rem',
            color: 'var(--text-primary-strong-color)'
          }}
        >
          Economic Calendar (New York Time)
        </Text>
      </div>
      <div css={scrollContainerStyles}>
        <Spin spinning={loading}>
          <List
            dataSource={events}
            renderItem={(item: EconomicCalendar) => {
              const isExpanded = expandedIds.has(item.id);
              const hasDescription = !!item.description;

              const nyTime = dayjs(item.start).tz(TimeZone.NEW_YORK);

              return (
                <List.Item
                  key={item.id}
                  css={listItemStyles}
                  onClick={(e) => hasDescription && toggleExpand(item.id, e)}
                  style={{ cursor: hasDescription ? 'pointer' : 'default' }}
                >
                  <div className='calendar-box'>
                    <div className='calendar-header'>
                      {nyTime.format('MMM')}
                    </div>
                    <div className='calendar-body'>{nyTime.format('DD')}</div>
                    <div className='calendar-time'>
                      {nyTime.format('HH:mm')}
                    </div>
                  </div>
                  <div className='content-col'>
                    <div className='content-header'>
                      <div className='info-group'>
                        <Text
                          className='title'
                          ellipsis={{ tooltip: item.name }}
                        >
                          {item.name}
                        </Text>
                        <div className='meta'>
                          <Tag
                            color={getImpactColor(item.impact)}
                            bordered={false}
                            css={tagStyles}
                          >
                            {item.impact}
                          </Tag>
                        </div>
                      </div>
                      {hasDescription && (
                        <div className='expand-icon'>
                          {isExpanded ? <UpOutlined /> : <DownOutlined />}
                        </div>
                      )}
                    </div>

                    {isExpanded && hasDescription && (
                      <div className='description-box'>
                        <div
                          className='description-text'
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </Spin>
      </div>
    </div>
  );

  return (
    <div css={rootStyles}>
      <Tooltip title='Economic Calendar' placement='bottom'>
        <Popover
          content={content}
          trigger='click'
          placement='bottomRight'
          onOpenChange={(visible) => visible && setNewEventsCount(0)}
          overlayInnerStyle={{
            padding: 0,
            borderRadius: '1.2rem',
            overflow: 'hidden',
            background: 'var(--surface-elevated-color)'
          }}
        >
          <Badge
            count={newEventsCount}
            offset={[0, 0]}
            color='gold'
            css={countBadgeStyles}
          >
            <button
              type='button'
              aria-label='Open economic calendar'
              css={iconWrapperStyles}
            >
              <Icon
                icon='calendar'
                width={24}
                height={24}
                fill='var(--earning-color)'
              />
            </button>
          </Badge>
        </Popover>
      </Tooltip>
    </div>
  );
};

const rootStyles = css`
  margin-right: 0.8rem;
`;

const countBadgeStyles = css`
  .ant-badge-count {
    color: var(--white-color) !important;
    font-weight: 600;
  }
`;

const popoverContentStyles = css`
  width: 50rem;
  display: flex;
  flex-direction: column;
  background: var(--surface-elevated-color);
  border-radius: 1.2rem;
  overflow: hidden;
`;

const scrollContainerStyles = css`
  max-height: 45rem;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0.4rem;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--surface-muted-color);
    border-radius: 0.4rem;
  }
`;

const headerStyles = css`
  padding: 1rem 1.4rem;
  border-bottom: 0.1rem solid var(--surface-muted-color);
  background: var(--surface-elevated-color);
`;

const listItemStyles = css`
  padding: 1.2rem 1.6rem !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 1.6rem;
  border-bottom: 0.1rem solid var(--surface-muted-color) !important;
  transition: background 0.2s;
  background: var(--surface-elevated-color);

  &:hover {
    background: var(--surface-hover-color);
  }
  &:last-child {
    border-bottom: none !important;
  }

  .calendar-box {
    display: flex;
    flex-direction: column;
    min-width: 4.8rem;
    height: 5.6rem;
    border: 0.1rem solid var(--border-light-color);
    border-radius: 0.4rem;
    overflow: hidden;
    background: var(--surface-elevated-color);
    flex-shrink: 0;
    margin-top: 0.2rem;

    .calendar-header {
      background: var(--danger-soft-color);
      color: var(--white-color);
      font-size: 0.9rem;
      font-weight: 800;
      text-align: center;
      padding: 0.1rem 0;
      text-transform: uppercase;
      line-height: 1.4;
    }

    .calendar-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--text-primary-strong-color);
      line-height: 1;
    }

    .calendar-time {
      font-size: 1rem;
      font-weight: 700;
      text-align: center;
      padding-bottom: 0.1rem;
      color: var(--text-secondary-color);
      background: var(--surface-subtle-color);
      border-top: 0.1rem solid var(--surface-muted-color);
    }
  }

  .content-col {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .content-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
    }

    .info-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .expand-icon {
      margin-left: 0.8rem;
      margin-top: 0.4rem;
      color: var(--text-tertiary-color);
      font-size: 1.2rem;
    }

    .title {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-heading-color);
      line-height: 1.4;
    }

    .description-box {
      margin-top: 0.8rem;
      padding: 0.8rem;
      background: var(--surface-subtle-color);
      border-radius: 0.4rem;
      border: 1px solid var(--surface-muted-color);

      .description-text {
        font-size: 1.3rem;
        color: var(--text-secondary-color);
        line-height: 1.5;

        p {
          margin-bottom: 0.8rem;
        }
        p:last-child {
          margin-bottom: 0;
        }
        ul,
        ol {
          padding-left: 2rem;
          margin-bottom: 0.8rem;
        }
        li {
          margin-bottom: 0.4rem;
        }
        b,
        strong {
          font-weight: 600;
        }
        a {
          color: var(--blue-500);
          text-decoration: underline;
        }
      }
    }
  }
`;

const tagStyles = css`
  font-size: 1rem;
  font-weight: 800;
  padding: 0 0.6rem;
  border-radius: 0.2rem;
  text-transform: uppercase;
  line-height: 1.6;
`;

const iconWrapperStyles = css`
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
