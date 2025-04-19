/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Col, Form, InputNumber, Row, Select, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

import { Impact, Sentiment } from '@/constants/common.constant';
import { getSentimentText } from '@/helpers/sentiment.helper';
import { useEffect } from 'react';

type ListWatcherFilterProps = {
  customStyles?: SerializedStyles;
  onFilter: (values: SentimentFilter) => void;
};

export const ListWatcherFilter = ({
  customStyles,
  onFilter
}: ListWatcherFilterProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const groupOptions = [
    {
      value: 'group_1',
      label: `${t('group')} 1`
    },
    {
      value: 'group_2',
      label: `${t('group')} 2`
    },
    {
      value: 'group_3',
      label: `${t('group')} 3`
    }
  ];

  const sentimentOptions = [
    {
      value: Sentiment.VeryPositive,
      label: getSentimentText(Sentiment.VeryPositive, t)
    },
    {
      value: Sentiment.VeryNegative,
      label: getSentimentText(Sentiment.VeryNegative, t)
    }
  ];

  const impactOptions = [
    {
      value: Impact.High,
      label: t('high')
    },
    {
      value: Impact.Critical,
      label: t('critical')
    }
  ];

  const updateSearchParams = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onFilter({
      lastHours: values.lastHours,
      group: values.group,
      sentiment: values.sentiment,
      impact: values.impact
    });
  };

  const handleClearFilters = () => {
    form.resetFields();
    onFilter({});
    router.push('?', { scroll: false });
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const initialValues = {
      lastHours: params.get('lastHours')
        ? Number(params.get('lastHours'))
        : 168, // 168 hours = 7days
      group: params.get('group') || undefined,
      sentiment: params.get('sentiment') || undefined,
      impact: params.get('impact') || undefined
    };

    form.setFieldsValue(initialValues);
  }, [searchParams, form]);

  return (
    <div css={[rootStyles, customStyles]}>
      <Form
        form={form}
        name='list-watcher'
        onFinish={handleSearch}
        css={formStyles}
        layout='horizontal'
      >
        <Row gutter={[16, 12]} align='bottom' justify='end'>
          <Col>
            <Form.Item css={formItemStyles} name='lastHours' initialValue={168}>
              <InputNumber css={inputStyles} addonAfter={t('hours')} />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item css={formItemStyles} name='group'>
              <Select
                css={inputStyles}
                options={groupOptions}
                placeholder={t('group')}
                allowClear
                onSelect={(value) => updateSearchParams('group', value)}
                onClear={() => updateSearchParams('group')}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item css={formItemStyles} name='sentiment'>
              <Select
                css={inputStyles}
                options={sentimentOptions}
                placeholder={t('sentiment')}
                allowClear
                onSelect={(value) => updateSearchParams('sentiment', value)}
                onClear={() => updateSearchParams('sentiment')}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item css={formItemStyles} name='impact'>
              <Select
                css={inputStyles}
                options={impactOptions}
                placeholder={t('impact')}
                allowClear
                onSelect={(value) => updateSearchParams('impact', value)}
                onClear={() => updateSearchParams('impact')}
              />
            </Form.Item>
          </Col>
          <Col>
            <Space size='small'>
              <Button
                htmlType='submit'
                type='primary'
                icon={<SearchOutlined />}
              >
                {t('search')}
              </Button>
              <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
                {t('clear')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.4rem 1.6rem;
`;

const formStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.6rem;
`;

const formItemStyles = css`
  margin-bottom: 0;
`;

const inputStyles = css`
  width: 14rem !important;
`;
