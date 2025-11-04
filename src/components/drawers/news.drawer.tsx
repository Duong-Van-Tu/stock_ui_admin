/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { Drawer, Spin, List, Typography } from 'antd';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getTickerNewsSentiment,
  watchTickerNewsSentiment,
  watchTickerNewsSentimentLoading
} from '@/redux/slices/sentiment.slice';
import { EmptyDataTable } from '../tables/empty.table';
import { TimeZone } from '@/constants/timezone.constant';
import { roundToDecimals } from '@/utils/common';
import { SentimentSCore } from '../charts/sentiment-score.chart';

const { Text } = Typography;

type NewsDrawerProps = {
  symbol: string;
  avgSentiment: number;
  entryDate?: string;
};

const NewsDrawer = ({ symbol, avgSentiment, entryDate }: NewsDrawerProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const newsList = useAppSelector(watchTickerNewsSentiment);
  const loading = useAppSelector(watchTickerNewsSentimentLoading);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open)
      dispatch(getTickerNewsSentiment({ symbol, query: { entryDate } }));
  }, [open, dispatch, symbol, entryDate]);

  return (
    <>
      <div onClick={() => setOpen(true)} css={avgSentimentStyles}>
        <SentimentSCore score={roundToDecimals(avgSentiment, 2)!} />
      </div>

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

              return (
                <List.Item key={(item.key ?? idx) as React.Key}>
                  <List.Item.Meta
                    avatar={
                      <div css={sentimentSCoreStyles}>
                        <SentimentSCore score={item.sentiment} />
                      </div>
                    }
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <div css={metaDesc}>
                        <Text type='secondary'>{created}</Text>
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

  .ant-list-item-meta-avatar {
    margin-right: 1rem !important;
  }
`;

const loadingWrap = css`
  display: grid;
  place-items: center;
  padding: 2rem 0;
`;

const metaDesc = css`
  text-align: right;
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
  height: 4.6rem;
`;

const sentimentSCoreStyles = css`
  height: 4.6rem;
  width: 4.6rem;
`;
