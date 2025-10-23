/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Drawer, Tag, Spin, List, Typography, Space, Avatar } from 'antd';
import dayjs from 'dayjs';
import { Icon } from '../icons';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getTickerNewsSentiment,
  watchTickerNewsSentiment,
  watchTickerNewsSentimentLoading
} from '@/redux/slices/sentiment.slice';
import { EmptyDataTable } from '../tables/empty.table';
import { PositiveNegativeText } from '../positive-negative-text';
import { TimeZone } from '@/constants/timezone.constant';
import { isNumeric, roundToDecimals } from '@/utils/common';
import Link from 'next/link';
import { PageURLs } from '@/utils/navigate';

const { Text } = Typography;

type NewsDrawerProps = {
  symbol: string;
  avgSentiment: number;
};

const NewsDrawer = ({ symbol, avgSentiment }: NewsDrawerProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const newsList = useAppSelector(watchTickerNewsSentiment);
  const loading = useAppSelector(watchTickerNewsSentimentLoading);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) dispatch(getTickerNewsSentiment({ symbol }));
  }, [open, dispatch, symbol]);

  return (
    <>
      <Tag
        onClick={() => setOpen(true)}
        css={avgSentimentStyles}
        color={avgSentiment > 0 ? 'success' : 'error'}
      >
        {roundToDecimals(avgSentiment, 4)}
      </Tag>

      <Drawer
        css={drawerStyles}
        title={`${t('news')} (${symbol})`}
        placement='right'
        open={open}
        onClose={() => setOpen(false)}
        width={600}
      >
        {loading ? (
          <div css={loadingWrap}>
            <Spin />
          </div>
        ) : newsList.length === 0 ? (
          <div css={emptyStyles}>
            <EmptyDataTable />
          </div>
        ) : (
          <List
            css={listStyles}
            dataSource={newsList}
            renderItem={(item: NewsSentiment, idx) => {
              const created = dayjs(item.versionCreated)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm');
              const isPos = isNumeric(item.sentiment)
                ? item.sentiment > 0
                : false;
              const isNeg = isNumeric(item.sentiment)
                ? item.sentiment < 0
                : false;

              return (
                <List.Item key={(item.key ?? idx) as React.Key}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        css={css`
                          background: none;
                        `}
                        icon={<Icon icon='news' width={30} height={30} />}
                      />
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div css={metaDesc}>
                        <Space size={8} wrap>
                          <PositiveNegativeText
                            isPositive={isPos}
                            isNegative={isNeg}
                          >
                            <Tag
                              color={item.sentiment > 0 ? 'success' : 'error'}
                            >
                              {isNumeric(item.sentiment)
                                ? `${t('sentiment')}: ${roundToDecimals(
                                    item.sentiment
                                  )}`
                                : item.sentiment}
                            </Tag>
                          </PositiveNegativeText>
                          <Link href={PageURLs.ofStockDetail(symbol)}>
                            <Tag css={pillTicker}>{item.symbol}</Tag>
                          </Link>

                          <Text type='secondary'>{created}</Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Drawer>
    </>
  );
};

export default NewsDrawer;

const listStyles = css`
  .ant-list-items {
    display: flex;
    flex-direction: column;
    padding: 0 0.8rem;
  }
`;

const loadingWrap = css`
  display: grid;
  place-items: center;
  padding: 2rem 0;
`;

const metaDesc = css`
  display: flex;
  align-items: center;
  .ant-space {
    width: 100%;
    .ant-space-item:last-child {
      flex: 1;
      text-align: right;
    }
  }
`;

const pillTicker = css`
  border-radius: 10px;
  padding: 0 6px;
  border: 1px solid var(--brand-blue-color);
  background: var(--blue-100);
  color: var(--symbol-color);
  font-weight: 600;
`;

const emptyStyles = css`
  display: flex;
  justify-content: center;
  padding: 3rem 0;
`;

const drawerStyles = css`
  .ant-drawer-body {
    padding: 0rem 1.6rem;
    margin-bottom: 2rem;
  }
`;

const avgSentimentStyles = css`
  cursor: pointer;
  min-width: 6rem;
  text-align: center;
  font-weight: 600;
  font-size: 1.4rem;
`;
