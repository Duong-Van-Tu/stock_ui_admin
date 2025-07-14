/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Typography, Tag, Space, Image, Select, Empty } from 'antd';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import Link from 'next/link';
import { getImpactColor } from '@/helpers/sentiment.helper';
import { Impact } from '@/constants/common.constant';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  getCompanyNews,
  watchCompanyNews
} from '@/redux/slices/sentiment.slice';
import { getThumbnail } from '@/utils/common';
import { useTranslations } from 'next-intl';
import { getRangeDateOptions } from '@/utils/stock-filter';

const DEFAULT_RANGE = 7;
const { Text } = Typography;

type CardNewsProps = {
  symbol: string;
};

export const CardNews = ({ symbol }: CardNewsProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const companyNews = useAppSelector(watchCompanyNews);

  const [range, setRange] = useState<number>(DEFAULT_RANGE);

  const toDate = dayjs().format('YYYY-MM-DD');
  const fromDate = dayjs().subtract(range, 'day').format('YYYY-MM-DD');

  const handleRangeChange = (value: number) => {
    setRange(value);
  };

  const renderSentimentTag = (sentiment: Sentiment) => {
    let color = '';
    switch (sentiment) {
      case 'positive':
        color = 'success';
        break;
      case 'very_positive':
        color = 'blue';
        break;
      case 'negative':
        color = 'error';
        break;
      case 'very_negative':
        color = 'warning';
        break;
      default:
        color = 'default';
    }

    const label = sentiment.includes('_')
      ? sentiment
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

    return <Tag color={color}>{label}</Tag>;
  };

  const fetchCompanyNews = useCallback(
    ({ page = PAGINATION_PARAMS.offset, pageSize = 5 }: PageChangeParams) => {
      dispatch(
        getCompanyNews({
          symbol,
          query: { fromDate, toDate, page, limit: pageSize }
        })
      );
    },
    [dispatch, symbol, fromDate, toDate]
  );

  useEffect(() => {
    fetchCompanyNews({});
  }, [fetchCompanyNews]);

  return (
    <Card
      css={rootStyles}
      title={
        <div css={titleStyles}>
          <h3>
            <span>{t('news')}</span>
          </h3>
          <Select
            defaultValue={DEFAULT_RANGE}
            onChange={handleRangeChange}
            css={selectStyles}
            options={getRangeDateOptions(t)}
          />
        </div>
      }
    >
      <div css={cardContainerStyles}>
        {companyNews.length > 0 ? (
          <>
            <div css={newsListStyles}>
              {companyNews.map((news, index) => (
                <Card
                  key={`${news.url}-${index}`}
                  css={cardStyles}
                  hoverable
                  size='small'
                >
                  <Link href={news.url} passHref legacyBehavior>
                    <a
                      target='_blank'
                      rel='noopener noreferrer'
                      css={contentStyles}
                    >
                      <div css={infoStyles}>
                        <Text strong ellipsis css={headlineStyles}>
                          {news.headline}
                        </Text>

                        <Space size='small'>
                          {renderSentimentTag(news.sentiment)}
                          <Tag color={getImpactColor(news.impact as Impact)}>
                            {news.impact}
                          </Tag>
                        </Space>
                        <Text type='secondary' css={timestampStyles}>
                          {dayjs(news.timestamp)
                            .tz(TimeZone.NEW_YORK)
                            .format('YYYY-MM-DD HH:mm')}{' '}
                          | {news.source}
                        </Text>
                      </div>
                      <Image
                        width={100}
                        src={getThumbnail(news.url, 280, 240)}
                        preview={false}
                        css={imageStyles}
                        alt='news thumbnail'
                      />
                    </a>
                  </Link>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Empty css={emptyStyles} />
        )}
      </div>
    </Card>
  );
};

const rootStyles = css`
  .ant-card-body {
    padding: 1.6rem;
  }
`;

const cardContainerStyles = css`
  display: flex;
  gap: 2rem;
`;
const newsListStyles = css`
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;
const cardStyles = css`
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0px 0.4rem 1rem rgba(0, 0, 0, 0.3);
  }
`;

const titleStyles = css`
  display: flex;
  justify-content: space-between;
  h3 {
    font-size: 2rem;
    margin-bottom: 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
`;

const contentStyles = css`
  display: flex;
  gap: 1.6rem;
  align-items: center;
`;

const imageStyles = css`
  flex-shrink: 0;
  border-radius: 0.4rem;
  object-fit: cover;
`;

const infoStyles = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const headlineStyles = css`
  font-size: 1.6rem;
  white-space: unset;
`;

const timestampStyles = css`
  margin-top: 0.6rem;
  font-size: 1.4rem;
`;

const selectStyles = css`
  width: 10rem;
  height: 2.8rem;

  .ant-select-selector {
    background: var(--blue-100) !important;

    .ant-select-selection-item {
      font-weight: 500;
    }
  }
`;

const emptyStyles = css`
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;
