import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getBreakingNews,
  watchBreakingNews
} from '@/redux/slices/sentiment.slice';
import { Dropdown, Space, Badge, Typography, Tag } from 'antd';
import { Icon } from './icons';
import { PositiveNegativeText } from './positive-negative-text';
import { PageURLs } from '@/utils/navigate';
import { roundToDecimals, formatTimeAgo } from '@/utils/common';

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
                paddingTop: '1.4rem'
              }}
            >
              <Space>
                <span>
                  <Text
                    type='secondary'
                    style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}
                  >
                    {formatTimeAgo(news.datetime)}
                  </Text>
                  {(news.breakingNews === 1 || news.breakingNews === -1) && (
                    <Tag
                      color={news.articleScore > 0 ? 'green' : 'red'}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Article: {roundToDecimals(news.articleScore * 10)}
                    </Tag>
                  )}
                  {(news.breakingNews === 1 || news.breakingNews === -1) && (
                    <span
                      style={{
                        marginRight: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
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
                    </span>
                  )}
                  {news.title}{' '}
                  <Tag
                    color='blue'
                    style={{
                      marginLeft: '0.4rem',
                      fontWeight: 600,
                      fontSize: '1.3rem'
                    }}
                  >
                    {news.symbol}
                  </Tag>
                </span>
              </Space>
              <Space>
                {isNew && <Badge color='#1890ff' status='processing' />}
              </Space>
            </Space>
          </a>
        </Link>
      ),
      onClick: () => setSelectedStoryId(news.storyId)
    };
  });

  return breakingNews.length > 0 && displayNews ? (
    <Dropdown
      menu={{
        items: menuItems,
        style: { maxHeight: '400px', overflowY: 'auto', maxWidth: '600px' }
      }}
      trigger={['click']}
      onOpenChange={handleDropdownVisibleChange}
    >
      <Space>
        {(displayNews.breakingNews === 1 ||
          displayNews.breakingNews === -1) && (
          <Badge
            count={roundToDecimals(displayNews.articleScore * 10)}
            color='gold'
            offset={[10, -6]}
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
              maxWidth: '50rem',
              color: 'inherit',
              verticalAlign: 'middle'
            }}
            ellipsis={{
              tooltip: `${displayNews.title} (${displayNews.symbol})`
            }}
          >
            {displayNews.title}{' '}
            <Tag
              color='blue'
              style={{
                marginLeft: '0.4rem',
                fontWeight: 600,
                fontSize: '1.3rem'
              }}
            >
              {displayNews.symbol}
            </Tag>
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
