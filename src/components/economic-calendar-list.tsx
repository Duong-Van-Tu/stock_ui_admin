'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Popover, List, Badge, Typography, Spin, Tag } from 'antd';
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
        return '#ff4d4f';
      case 'MEDIUM':
        return '#faad14';
      default:
        return '#52c41a';
    }
  };

  const content = (
    <div css={popoverContentStyles}>
      <div css={headerStyles}>
        <Text strong style={{ fontSize: '1.5rem', color: '#1a1a1a' }}>
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
      <Popover
        content={content}
        trigger='click'
        placement='bottomRight'
        onOpenChange={(visible) => visible && setNewEventsCount(0)}
        overlayInnerStyle={{ padding: 0 }}
      >
        <Badge count={newEventsCount} offset={[0, 0]} color='gold'>
          <div css={iconWrapperStyles}>
            <Icon
              icon='calendar'
              width={24}
              height={24}
              fill='var(--earning-color)'
            />
          </div>
        </Badge>
      </Popover>
    </div>
  );
};

const rootStyles = css`
  margin-right: 0.8rem;
`;

const popoverContentStyles = css`
  width: 50rem;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const scrollContainerStyles = css`
  max-height: 45rem;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 0.4rem;
  }
  ::-webkit-scrollbar-thumb {
    background: #f0f0f0;
    border-radius: 0.4rem;
  }
`;

const headerStyles = css`
  padding: 1rem 1.4rem;
  border-bottom: 0.1rem solid #f0f0f0;
  background: #fff;
`;

const listItemStyles = css`
  padding: 1.2rem 1.6rem !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 1.6rem;
  border-bottom: 0.1rem solid #f0f0f0 !important;
  transition: background 0.2s;

  &:hover {
    background: #fcfcfc;
  }
  &:last-child {
    border-bottom: none !important;
  }

  .calendar-box {
    display: flex;
    flex-direction: column;
    min-width: 4.8rem;
    height: 5.6rem;
    border: 0.1rem solid #e8e8e8;
    border-radius: 0.4rem;
    overflow: hidden;
    background: #fff;
    flex-shrink: 0;
    margin-top: 0.2rem;

    .calendar-header {
      background: #ff4d4f;
      color: #fff;
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
      color: #1a1a1a;
      line-height: 1;
    }

    .calendar-time {
      font-size: 1rem;
      font-weight: 700;
      text-align: center;
      padding-bottom: 0.1rem;
      color: #595959;
      background: #fafafa;
      border-top: 0.1rem solid #f0f0f0;
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
      color: #8c8c8c;
      font-size: 1.2rem;
    }

    .title {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
      color: #262626;
      line-height: 1.4;
    }

    .description-box {
      margin-top: 0.8rem;
      padding: 0.8rem;
      background: #fafafa;
      border-radius: 0.4rem;
      border: 1px solid #f0f0f0;

      .description-text {
        font-size: 1.3rem;
        color: #595959;
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
          color: #1890ff;
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
`;
