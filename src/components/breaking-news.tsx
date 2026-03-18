import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getBreakingNews,
  watchBreakingNews
} from '@/redux/slices/sentiment.slice';
import { Dropdown, Space, Badge, Typography, Tag } from 'antd';
import { Icon } from './icons';
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
                  {news.title} <Tag style={symbolTagStyles}>{news.symbol}</Tag>
                </span>
              </Space>
              <Space>
                {isNew && <Badge color='#1890ff' status='processing' />}
              </Space>
            </Space>
          </a>
        </Link>
      ),
      onClick: () => setSelectedStoryId(news.storyId),
      style:
        news.isHighlight === 1
          ? {
              background: 'var(--shell-hover-color)',
              borderLeft: `0.3rem solid ${
                news.breakingNews === 1
                  ? 'var(--positive-color)'
                  : 'var(--negative-color)'
              }`,
              boxShadow: `inset 0 0 0 1px var(--shell-accent-color)`,
              borderRadius: '0.8rem'
            }
          : undefined
    };
  });

  return breakingNews.length > 0 && displayNews ? (
    <Dropdown
      menu={{
        items: menuItems,
        style: {
          maxHeight: '400px',
          overflowY: 'auto',
          maxWidth: 'min(60rem, calc(100vw - 3.2rem))'
        }
      }}
      trigger={['click']}
      onOpenChange={handleDropdownVisibleChange}
    >
      <div
        style={{
          width: '100%',
          minWidth: 0,
          maxWidth: '56rem',
          background: 'var(--shell-hover-color)',
          border: '1px solid var(--shell-accent-color)',
          borderRadius: '1rem',
          padding: '0.8rem 1.2rem'
        }}
      >
        <div
          style={{
            width: '100%',
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Text
                type='secondary'
                style={{
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}
              >
                {formatTimeAgo(displayNews.datetime)}
              </Text>
              {(displayNews.breakingNews === 1 ||
                displayNews.breakingNews === -1) && (
                <Tag
                  color={displayNews.articleScore > 0 ? 'green' : 'red'}
                  style={articleTagStyles}
                >
                  Article: {roundToDecimals(displayNews.articleScore * 10)}
                </Tag>
              )}
              {(displayNews.breakingNews === 1 ||
                displayNews.breakingNews === -1) && (
                <span
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
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
                </span>
              )}
              <Text
                style={{
                  flex: 1,
                  minWidth: 0,
                  color:
                    displayNews.breakingNews === 1
                      ? 'var(--positive-color)'
                      : displayNews.breakingNews === -1
                        ? 'var(--negative-color)'
                        : 'var(--yellow-color)',
                  verticalAlign: 'middle',
                  display: 'block'
                }}
                ellipsis={{
                  tooltip: `${displayNews.title} (${displayNews.symbol})`
                }}
              >
                {displayNews.title}
              </Text>
              <Tag style={headlineSymbolTagStyles}>{displayNews.symbol}</Tag>
            </div>
          </div>

          <span style={{ flexShrink: 0, display: 'flex' }}>
            <Badge dot={hasNewNews} color='#1890ff' offset={[2, 0]}>
              <Icon icon='arrowDown' width={14} height={14} />
            </Badge>
          </span>
        </div>
      </div>
    </Dropdown>
  ) : null;
}

const symbolTagStyles = {
  marginLeft: '0.4rem',
  fontWeight: 600,
  fontSize: '1.3rem',
  color: 'var(--primary-color)',
  border: '1px solid var(--shell-accent-color)',
  background: 'transparent'
};

const articleTagStyles = {
  marginRight: 0,
  flexShrink: 0
};

const headlineSymbolTagStyles = {
  ...symbolTagStyles,
  flexShrink: 0
};
