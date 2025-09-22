/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Typography, Button, Row, Col, Divider } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/redux/hooks';
import { watchStockDetails } from '@/redux/slices/stock-details.slice';
import { ScoreBlock } from '../score-block';

const { Text } = Typography;

export const StockDetailHeader = () => {
  const t = useTranslations();
  const stockDetail = useAppSelector(watchStockDetails);

  return (
    <div css={rootStyles}>
      <Row gutter={[24, 16]} align='middle' justify='space-between'>
        <Col>
          <Text type='secondary'>
            {[
              stockDetail?.sector,
              stockDetail?.subIndustry,
              stockDetail?.currency
            ]
              .filter(Boolean)
              .join(' • ')}
          </Text>
          <div css={companyInfoStyles}>
            <div css={titleStyles}>
              {stockDetail?.companyName} ({stockDetail?.ticker})
            </div>
            <Button
              icon={
                stockDetail?.isAddWatchList ? <StarFilled /> : <StarOutlined />
              }
              shape='round'
            >
              {stockDetail?.isAddWatchList ? t('following') : t('follow')}
            </Button>
          </div>
        </Col>

        <Col flex={1}>
          <div css={scoreWrapperStyles}>
            <ScoreBlock
              label={t('totalScore')}
              value={stockDetail?.totalScore}
              size='1.8rem'
            />
            <Divider type='vertical' css={dividerStyles} />
            <ScoreBlock
              label={t('fundamentalScore')}
              value={stockDetail?.fundamentalScore}
            />
            <ScoreBlock
              label={t('sentimentScore')}
              value={stockDetail?.sentimentScore}
            />
            <ScoreBlock
              label={t('earningsScore')}
              value={stockDetail?.earningsScore}
            />
            <ScoreBlock
              label={t('performance')}
              value={stockDetail?.performanceScore}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

const rootStyles = css`
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--border-color);
`;

const companyInfoStyles = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;

const titleStyles = css`
  font-size: 2rem;
  font-weight: 600;
`;

const scoreWrapperStyles = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

const dividerStyles = css`
  height: 4rem;
`;
