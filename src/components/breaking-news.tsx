import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getBreakingNews,
  watchBreakingNews
} from '@/redux/slices/sentiment.slice';
import { Dropdown, Space, Badge, Typography } from 'antd';
import { Icon } from './icons';
import { PositiveNegativeText } from './positive-negative-text';
import { PageURLs } from '@/utils/navigate';
import { roundToDecimals } from '@/utils/common';

const { Text } = Typography;

export default function BreakingNews() {
  const dispatch = useAppDispatch();
  const breakingNews = useAppSelector(watchBreakingNews);

  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBreakingNews());

    const interval = setInterval(() => {
      dispatch(getBreakingNews());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (isInitialLoad && breakingNews.length > 0) {
      const initialIds = new Set(breakingNews.map((news) => news.storyId));
      setViewedIds(initialIds);
      setIsInitialLoad(false);
    }
  }, [breakingNews, isInitialLoad]);

  const hasNewNews = useMemo(() => {
    return breakingNews.some((news) => !viewedIds.has(news.storyId));
  }, [breakingNews, viewedIds]);

  const displayNews = useMemo(() => {
    if (breakingNews.length === 0) return null;
    return (
      breakingNews.find((news) => news.storyId === selectedStoryId) ||
      breakingNews[0]
    );
  }, [breakingNews, selectedStoryId]);

  const handleDropdownVisibleChange = (visible: boolean) => {
    if (visible && hasNewNews) {
      const currentIds = new Set(breakingNews.map((news) => news.storyId));
      setViewedIds(currentIds);
    }
  };

  const menuItems = breakingNews.map((news) => {
    const isNew = !viewedIds.has(news.storyId) && !isInitialLoad;
    const newsLink = `${PageURLs.ofFinnhubLsegNews()}?storyId=${news.storyId}`;

    return {
      key: news.storyId || news.key,
      label: (
        <Link href={newsLink} legacyBehavior>
          <a
            style={{
              display: 'block',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            <Space
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '1.4rem 0 0 2.4rem'
              }}
            >
              <Space>
                {(news.breakingNews === 1 || news.breakingNews === -1) && (
                  <Badge
                    count={roundToDecimals(news.articleScore * 10)}
                    color='gold'
                    offset={[-30, -6]}
                  >
                    <Icon
                      icon='fire'
                      width={18}
                      height={18}
                      fill={
                        news.breakingNews === 1
                          ? 'var(--positive-color)'
                          : 'var(--negative-color)'
                      }
                    />
                  </Badge>
                )}
                <span>{news.title}</span>
              </Space>
              {isNew && <Badge color='#1890ff' status='processing' />}
            </Space>
          </a>
        </Link>
      ),
      onClick: () => setSelectedStoryId(news.storyId)
    };
  });

  return breakingNews.length > 0 && displayNews ? (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      onOpenChange={handleDropdownVisibleChange}
    >
      <Space style={{ width: '100%', paddingLeft: '2rem' }}>
        {(displayNews.breakingNews === 1 ||
          displayNews.breakingNews === -1) && (
          <Badge
            count={roundToDecimals(displayNews.articleScore * 10)}
            color='gold'
            offset={[-28, -4]}
          >
            <Icon
              icon='fire'
              width={18}
              height={18}
              fill={
                displayNews.breakingNews === 1
                  ? 'var(--positive-color)'
                  : 'var(--negative-color)'
              }
            />
          </Badge>
        )}
        <PositiveNegativeText
          isPositive={displayNews.breakingNews === 1}
          isNegative={displayNews.breakingNews === -1}
        >
          <Text
            style={{
              maxWidth: '60rem',
              color: 'inherit',
              verticalAlign: 'middle'
            }}
            ellipsis={{ tooltip: displayNews.title }}
          >
            {displayNews.title}
          </Text>
        </PositiveNegativeText>

        <span style={{ flexShrink: 0, display: 'flex' }}>
          <Badge dot={hasNewNews} color='#1890ff' offset={[2, 0]}>
            <Icon icon='arrowDown' width={14} height={14} />
          </Badge>
        </span>
      </Space>
    </Dropdown>
  ) : null;
}
