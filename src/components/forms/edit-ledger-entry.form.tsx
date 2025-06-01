/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Spin,
  Typography,
  Space,
  Tooltip
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '../icons';
import { ReactQuillEditor } from '../react-quill-editor';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getLedgerEntryById,
  updateLedgerEntry,
  watchLedgerEntryLoading,
  watchSelectedLedgerEntry
} from '@/redux/slices/ledger-entry.slice';
import dayjs from 'dayjs';
import { useNotification } from '@/hooks/notification.hook';
import { isRequestSuccess } from '@/utils/request-status';
import { getSectors, watchSectors } from '@/redux/slices/stock-score.slice';
import { PageURLs } from '@/utils/navigate';

const { Title } = Typography;
const { Option } = Select;

export default function EditLedgerEntry() {
  const t = useTranslations();
  const router = useRouter();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const params = useParams();
  const id = params.id as string;
  const selectedEntry = useAppSelector(watchSelectedLedgerEntry);
  const loading = useAppSelector(watchLedgerEntryLoading);
  const sectors = useAppSelector(watchSectors);

  const sectorOptions = useMemo(
    () => [
      { value: '', label: t('selectSector'), disabled: true },
      ...(sectors?.map((item) => ({
        value: item.sector,
        label: item.sector
      })) || [])
    ],
    [sectors]
  );

  const handleSubmit = async () => {
    const values = await form.getFieldsValue();
    const res = await dispatch(
      updateLedgerEntry({
        id,
        data: {
          ...values,
          entryDate: values.entryDate?.toISOString(),
          exitDate: values.exitDate?.toISOString(),
          expiration: values.expiration?.toISOString()
        }
      })
    );
    if (isRequestSuccess(res)) {
      notifySuccess(t('ledgerEntryUpdated'));
    } else {
      notifyError(t('updateFailed'));
    }
  };

  const handleGoBack = () => {
    router.push(PageURLs.ofLedgerEntry());
  };

  const handleSendAlert = () => {};

  useEffect(() => {
    if (id) {
      dispatch(getLedgerEntryById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(getSectors());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEntry) {
      form.setFieldsValue({
        symbol: selectedEntry.symbol,
        period: selectedEntry.period,
        entryDate: selectedEntry.entryDate
          ? dayjs(selectedEntry.entryDate)
          : null,
        entryPrice: selectedEntry.entryPrice,
        stockPL: selectedEntry.stockPL,
        contracts: selectedEntry.contracts,
        premiumPaid: selectedEntry.premiumPaid,
        investmentCashOut: selectedEntry.investmentCashOut,
        commission: selectedEntry.commission,
        strategy: selectedEntry.strategy,
        strike: selectedEntry.strike,
        exitDate: selectedEntry.exitDate ? dayjs(selectedEntry.exitDate) : null,
        exitPrice: selectedEntry.exitPrice,
        expiration: selectedEntry.expiration
          ? dayjs(selectedEntry.expiration)
          : null,
        action: selectedEntry.action,
        premiumReceive: selectedEntry.premiumReceive,
        investmentCashIn: selectedEntry.investmentCashIn,
        sector: selectedEntry.sector,
        notes: selectedEntry.notes
      });
    }
  }, [selectedEntry, form]);

  return (
    <Spin spinning={loading}>
      <div css={rootStyles}>
        <Title level={3} css={titleStyles}>
          {t('UpdateLedgerEntry')}
        </Title>
        <Tooltip title={t('back')} css={goBackStyles}>
          <Button
            shape='circle'
            icon={<Icon icon='back' width={18} height={18} />}
            onClick={handleGoBack}
          />
        </Tooltip>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          css={formStyles}
        >
          <div css={formContainerStyles}>
            <div css={formRowStyles}>
              <div css={formColumnStyles}>
                <Form.Item
                  name='symbol'
                  label={t('symbol')}
                  rules={[{ required: true, message: '' }]}
                >
                  <Input
                    size='large'
                    placeholder={t('enterSymbol')}
                    onChange={(e) =>
                      form.setFieldValue('symbol', e.target.value.toUpperCase())
                    }
                  />
                </Form.Item>
                <Form.Item name='period' label={t('period')}>
                  <Input
                    placeholder={t('enterPeriod')}
                    size='large'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='entryDate' label={t('entryDate')}>
                  <DatePicker
                    placeholder={t('selectEntryDate')}
                    size='large'
                    showTime
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='entryPrice' label={t('entryPrice')}>
                  <InputNumber
                    type='number'
                    placeholder={t('enterEntryPrice')}
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='stockPL' label={t('stockPL')}>
                  <InputNumber
                    type='number'
                    placeholder={t('enterStockPL')}
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='contracts' label={t('contracts')}>
                  <InputNumber
                    type='number'
                    size='large'
                    placeholder={t('enterNumberOfContracts')}
                    min={0}
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='premiumPaid' label={t('premiumPaid')}>
                  <InputNumber
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    placeholder={t('enterPremiumPaid')}
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item
                  name='investmentCashOut'
                  label={t('investmentCashOut')}
                >
                  <InputNumber
                    placeholder={t('enterInvestmentCashOut')}
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='commission' label={t('commission')}>
                  <InputNumber
                    placeholder={t('enterCommission')}
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
              </div>

              <div
                css={css`
                  width: 50%;
                `}
              >
                <Form.Item name='strategy' label={t('strategy')}>
                  <Input placeholder={t('enterStrategy')} size='large' />
                </Form.Item>
                <Form.Item name='strike' label={t('strike')}>
                  <InputNumber
                    type='number'
                    size='large'
                    placeholder={t('enterStrikePrice')}
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='exitDate' label={t('exitDate')}>
                  <DatePicker
                    placeholder={t('selectExitDate')}
                    size='large'
                    showTime
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='exitPrice' label={t('exitPrice')}>
                  <InputNumber
                    placeholder={t('enterExitPrice')}
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='expiration' label={t('expiration')}>
                  <DatePicker
                    placeholder={t('selectExpirationDate')}
                    size='large'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='action' label={t('action')}>
                  <Select size='large' placeholder={t('selectAction')}>
                    <Option value='' disabled>
                      {t('selectAction')}
                    </Option>
                    <Option value='Buy to Open CALL'>
                      {t('buyToOpenCALL')}
                    </Option>
                    <Option value='Sell to Close CALL'>
                      {t('sellToCloseCALL')}
                    </Option>
                    <Option value='Sell to Open CALL'>
                      {t('sellToOpenCALL')}
                    </Option>
                    <Option value='Buy to Close CALL'>
                      {t('buyToCloseCALL')}
                    </Option>
                    <Option value='Buy to Open PUT'>{t('buyToOpenPUT')}</Option>
                    <Option value='Sell to Close PUT'>
                      {t('sellToClosePUT')}
                    </Option>
                    <Option value='Sell to Open PUT'>
                      {t('sellToOpenPUT')}
                    </Option>
                    <Option value='Buy to Close PUT'>
                      {t('buyToClosePUT')}
                    </Option>
                  </Select>
                </Form.Item>
                <Form.Item name='premiumReceive' label={t('premiumReceive')}>
                  <InputNumber
                    placeholder={t('enterPremiumReceive')}
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item
                  name='investmentCashIn'
                  label={t('investmentCashIn')}
                >
                  <InputNumber
                    placeholder={t('enterInvestmentCashIn')}
                    type='number'
                    size='large'
                    min={0}
                    prefix='$'
                    css={fullWidthStyles}
                  />
                </Form.Item>
                <Form.Item name='sector' label={t('sector')}>
                  <Select
                    options={sectorOptions}
                    size='large'
                    placeholder={t('selectSector')}
                  ></Select>
                </Form.Item>
              </div>
            </div>
            <Form.Item
              name='notes'
              label={t('notes')}
              rules={[{ required: true, message: '' }]}
            >
              <ReactQuillEditor
                value=''
                onChange={() => {}}
                placeholder={t('EnterYourNotesHere')}
                showImage={false}
              />
            </Form.Item>
          </div>
          <Form.Item css={formActionsStyles}>
            <Space>
              <Button
                css={saveBtnStyles}
                type='primary'
                htmlType='submit'
                size='large'
                icon={
                  <Icon
                    icon='save'
                    fill='var(--white-color)'
                    width={18}
                    height={18}
                  />
                }
              >
                {t('save')}
              </Button>
              <Button
                type='primary'
                size='large'
                danger
                icon={
                  <Icon
                    icon='trash'
                    width={18}
                    height={18}
                    fill='var(--white-color)'
                  />
                }
              >
                {t('delete')}
              </Button>
              <Button
                onClick={handleSendAlert}
                type='primary'
                size='large'
                icon={
                  <Icon
                    fill='var(--white-color)'
                    icon='send'
                    width={18}
                    height={18}
                  />
                }
              >
                {t('sendAlertToMembers')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
}

const rootStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const goBackStyles = css`
  position: absolute;
  top: 0;
  left: 1rem;
`;
const formStyles = css`
  margin-top: 1.6rem;
  width: 100%;
  max-width: 120rem;
  .ant-form-item {
    margin-bottom: 1rem;
  }
  .ant-form-item-label {
    label {
      font-weight: 500;
      font-size: 1.6rem;
    }
  }
`;

const formRowStyles = css`
  display: flex;
  gap: 2rem;
`;

const formColumnStyles = css`
  width: 50%;
`;

const formContainerStyles = css`
  overflow-y: auto;
  padding-bottom: 4.8rem;
  max-height: calc(100vh - 14.8rem);
  width: 100%;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const titleStyles = css`
  text-align: center;
  margin-bottom: 0 !important;
`;

const formActionsStyles = css`
  padding: 1rem 2rem;
  display: flex;
  justify-content: flex-end;
  position: absolute;
  right: -2rem;
  left: -2rem;
  bottom: -2rem;
  margin-bottom: 0 !important;
  box-shadow: 0 -1.2px 2.4px var(--separator-color);
  background: var(--white-color);
`;

const fullWidthStyles = css`
  width: 100%;
`;

const saveBtnStyles = css`
  background: var(--green-color);
  &:hover {
    background: var(--green-color) !important;
    opacity: 0.85;
  }
`;
