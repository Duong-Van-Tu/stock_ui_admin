/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';
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
  Tooltip,
  Modal
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '../icons';
import { ReactQuillEditor } from '../react-quill-editor';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  deleteLedgerEntry,
  getLedgerEntryById,
  resetState,
  updateLedgerEntry,
  watchLedgerEntryLoading,
  watchSelectedLedgerEntry,
  watchUpdatingLedgerEntry
} from '@/redux/slices/ledger-entry.slice';
import dayjs from 'dayjs';
import { useNotification } from '@/hooks/notification.hook';
import { isRequestSuccess } from '@/utils/request-status';
import { getSectors, watchSectors } from '@/redux/slices/stock-score.slice';
import { PageURLs } from '@/utils/navigate';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import MemberListDrawer from '../drawers/member-list.drawer';
import { TimeZone } from '@/constants/timezone.constant';

const { Title } = Typography;
const { Option } = Select;

export default function EditLedgerEntry() {
  const t = useTranslations();
  const router = useRouter();
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const dispatch = useAppDispatch();
  const { notifySuccess, notifyError } = useNotification();
  const params = useParams();
  const id = params.id as string;
  const selectedEntry = useAppSelector(watchSelectedLedgerEntry);
  const loading = useAppSelector(watchLedgerEntryLoading);
  const updating = useAppSelector(watchUpdatingLedgerEntry);
  const sectors = useAppSelector(watchSectors);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleDelete = async () => {
    const res = await dispatch(deleteLedgerEntry(Number(id)));
    if (isRequestSuccess(res)) {
      notifySuccess(t('deleteSuccess'));
    } else {
      notifySuccess(t('deleteError'));
    }
    handleGoBack();
  };

  const confirmDeleteLedger = () => {
    modal.confirm({
      title: t('deleteConfirmationTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('deleteConfirmationDescription'),
      okText: t('yes'),
      cancelText: t('no'),
      onOk: handleDelete
    });
  };

  const sectorOptions = useMemo(
    () => [
      { value: '', label: t('selectSector'), disabled: true },
      ...(sectors?.map((item) => ({
        value: item.sector,
        label: item.sector
      })) || [])
    ],
    [sectors, t]
  );

  const handleSubmit = async () => {
    const values = await form.getFieldsValue();
    const res = await dispatch(
      updateLedgerEntry({
        id,
        data: {
          ...values,
          entryDate: values.entryDate
            ? dayjs(values.entryDate).format('YYYY-MM-DD HH:mm:ss')
            : null,
          exitDate: values.exitDate
            ? dayjs(values.exitDate).format('YYYY-MM-DD HH:mm:ss')
            : null,
          expiration: values.expiration
            ? dayjs(values.expiration).format('YYYY-MM-DD')
            : null
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

  useEffect(() => {
    if (id) {
      dispatch(getLedgerEntryById(id));
    }
    return () => {
      dispatch(resetState());
    };
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
          ? dayjs(selectedEntry.entryDate).utc()
          : null,
        entryPrice: selectedEntry.entryPrice,
        stockPL: selectedEntry.stockPL,
        contracts: selectedEntry.contracts,
        premiumPaid: selectedEntry.premiumPaid,
        investmentCashOut: selectedEntry.investmentCashOut,
        commission: selectedEntry.commission,
        strategy: selectedEntry.strategy,
        strike: selectedEntry.strike,
        exitDate: selectedEntry.exitDate
          ? dayjs(selectedEntry.exitDate).utc()
          : null,
        exitPrice: selectedEntry.exitPrice,
        expiration: selectedEntry.expiration
          ? dayjs(selectedEntry.expiration).utc()
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
    <>
      {contextHolder}
      <MemberListDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        ledgerEntry={{
          ...form.getFieldsValue(),
          entryDate: form.getFieldValue('entryDate')?.toISOString(),
          exitDate: form.getFieldValue('exitDate')?.toISOString(),
          expiration: form.getFieldValue('expiration')?.toISOString()
        }}
      />
      <Spin spinning={loading}>
        <div css={rootStyles}>
          <Title level={isMobile ? 4 : 3} css={titleStyles}>
            {t('UpdateLedgerEntry')}
          </Title>
          <Tooltip title={isMobile ? null : t('back')} css={goBackStyles}>
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
                  <Form.Item label={t('entryDate')}>
                    <Input.Group compact>
                      <Button
                        icon={<Icon icon='realtime' width={20} height={20} />}
                        onClick={() =>
                          form.setFieldValue(
                            'entryDate',
                            dayjs().tz(TimeZone.NEW_YORK)
                          )
                        }
                        size={isMobile ? 'middle' : 'large'}
                      />
                      <Form.Item name='entryDate' noStyle>
                        <DatePicker
                          placeholder={isMobile ? '' : t('selectEntryDate')}
                          size={isMobile ? 'middle' : 'large'}
                          showTime
                          css={css`
                            width: ${isMobile
                              ? 'calc(100% - 3.2rem)'
                              : 'calc(100% - 4rem)'};
                          `}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>

                  <Form.Item name='strategy' label={t('strategy')}>
                    <Input
                      placeholder={isMobile ? '' : t('enterStrategy')}
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Form.Item>

                  <Form.Item
                    name='symbol'
                    label={t('symbol')}
                    rules={[{ required: true, message: '' }]}
                  >
                    <Input
                      size={isMobile ? 'middle' : 'large'}
                      placeholder={isMobile ? '' : t('enterSymbol')}
                      onChange={(e) =>
                        form.setFieldValue(
                          'symbol',
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item name='strike' label={t('strike')}>
                    <InputNumber
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      placeholder={isMobile ? '' : t('enterStrikePrice')}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='premiumPaid' label={t('premiumPaid')}>
                    <InputNumber
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      placeholder={isMobile ? '' : t('enterPremiumPaid')}
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item
                    name='investmentCashOut'
                    label={t('investmentCashOut')}
                  >
                    <InputNumber
                      placeholder={isMobile ? '' : t('enterInvestmentCashOut')}
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='contracts' label={t('contracts')}>
                    <InputNumber
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      placeholder={isMobile ? '' : t('enterNumberOfContracts')}
                      min={0}
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='entryPrice' label={t('entryPrice')}>
                    <InputNumber
                      type='number'
                      placeholder={isMobile ? '' : t('enterEntryPrice')}
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='stockPL' label={t('stockPL')}>
                    <InputNumber
                      type='number'
                      placeholder={isMobile ? '' : t('enterStockPL')}
                      size={isMobile ? 'middle' : 'large'}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>
                </div>

                <div css={formColumnStyles}>
                  <Form.Item label={t('exitDate')}>
                    <Input.Group compact>
                      <Button
                        icon={<Icon icon='realtime' width={20} height={20} />}
                        onClick={() =>
                          form.setFieldValue(
                            'exitDate',
                            dayjs().tz(TimeZone.NEW_YORK)
                          )
                        }
                        size={isMobile ? 'middle' : 'large'}
                      />
                      <Form.Item name='exitDate' noStyle>
                        <DatePicker
                          placeholder={isMobile ? '' : t('selectExitDate')}
                          size={isMobile ? 'middle' : 'large'}
                          showTime
                          css={css`
                            width: ${isMobile
                              ? 'calc(100% - 3.2rem)'
                              : 'calc(100% - 4rem)'};
                          `}
                        />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>

                  <Form.Item name='period' label={t('period')}>
                    <Input
                      placeholder={isMobile ? '' : t('enterPeriod')}
                      size={isMobile ? 'middle' : 'large'}
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='action' label={t('action')}>
                    <Select
                      size={isMobile ? 'middle' : 'large'}
                      placeholder={t('selectAction')}
                    >
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
                      <Option value='Buy to Open PUT'>
                        {t('buyToOpenPUT')}
                      </Option>
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

                  <Form.Item name='expiration' label={t('expiration')}>
                    <DatePicker
                      placeholder={isMobile ? '' : t('selectExpirationDate')}
                      size={isMobile ? 'middle' : 'large'}
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='premiumReceive' label={t('premiumReceive')}>
                    <InputNumber
                      placeholder={isMobile ? '' : t('enterPremiumReceive')}
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
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
                      placeholder={isMobile ? '' : t('enterInvestmentCashIn')}
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='commission' label={t('commission')}>
                    <InputNumber
                      placeholder={isMobile ? '' : t('enterCommission')}
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='exitPrice' label={t('exitPrice')}>
                    <InputNumber
                      placeholder={isMobile ? '' : t('enterExitPrice')}
                      type='number'
                      size={isMobile ? 'middle' : 'large'}
                      min={0}
                      prefix='$'
                      css={fullWidthStyles}
                    />
                  </Form.Item>

                  <Form.Item name='sector' label={t('sector')}>
                    <Select
                      options={sectorOptions}
                      size={isMobile ? 'middle' : 'large'}
                      placeholder={t('selectSector')}
                    />
                  </Form.Item>
                </div>
              </div>

              <Form.Item name='notes' label={t('notes')}>
                <ReactQuillEditor
                  value=''
                  onChange={() => {}}
                  placeholder={isMobile ? '' : t('EnterYourNotesHere')}
                  showImage={false}
                  height={isMobile ? 150 : 200}
                />
              </Form.Item>
            </div>
            <Form.Item css={formActionsStyles}>
              <Space>
                <Button onClick={handleGoBack} type='default' size='large'>
                  {t('cancel')}
                </Button>
                <Button
                  loading={updating}
                  css={saveBtnStyles}
                  type='primary'
                  htmlType='submit'
                  size='large'
                  icon={
                    !updating ? (
                      <Icon
                        icon='save'
                        fill='var(--white-color)'
                        width={18}
                        height={18}
                      />
                    ) : undefined
                  }
                >
                  {t('save')}
                </Button>
                {!isMobile && (
                  <>
                    <Button
                      onClick={confirmDeleteLedger}
                      type='primary'
                      size={isMobile ? 'middle' : 'large'}
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
                      onClick={() => setDrawerVisible(true)}
                      type='primary'
                      size={isMobile ? 'middle' : 'large'}
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
                  </>
                )}
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Spin>
    </>
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
  top: ${isMobile ? '-0.4rem' : 0};
  left: ${isMobile ? '0.4rem' : '1rem'};
`;
const formStyles = css`
  margin-top: 1.6rem;
  width: 100%;
  max-width: 120rem;
  .ant-form-item {
    margin-bottom: 1rem;
  }
  .ant-form-item-label {
    padding-bottom: 0.4rem !important;
    label {
      font-weight: 500;
      font-size: ${isMobile ? '1.4rem' : '1.6rem'};
    }
  }
`;

const formRowStyles = css`
  display: flex;
  gap: ${!isMobile && '2rem'};
  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const formColumnStyles = css`
  width: 50%;
  @media (max-width: 480px) {
    width: 100%;
  }
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
  justify-content: ${isMobile ? 'center' : 'flex-end'};
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
