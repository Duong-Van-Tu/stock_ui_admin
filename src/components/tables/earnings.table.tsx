/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
// import { Table, TableColumnsType } from 'antd';
// import { useTranslations } from 'next-intl';
import { EarningFilter } from '../filters/earnings.filter';
// import { TableTitle } from './title.table';
// import { useWindowSize } from '@/hooks/useWindowSize';
// import { EmptyDataTable } from './empty.table';
// import { PAGINATION } from '@/constants/pagination.constant';

export const EarningsTable = () => {
  // const t = useTranslations();
  // const { height } = useWindowSize();

  // const earningsData: Earning[] = [];

  // const pagination = PAGINATION;

  const [filter, setFilter] = useState<EarningFilter>({ earningDate: '' });

  // const columns: TableColumnsType<Earning> = [];

  const handleFilter = (values: EarningFilter) => {
    const newFilter = {
      ...filter,
      ...values
    };
    setFilter(newFilter);
  };

  return (
    <div css={rootStyles}>
      <EarningFilter onFilter={handleFilter} />
      {/* <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <TableTitle>{t('earningTitle')}</TableTitle>
        </div>
        <Table<Earning>
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={earningsData}
          loading={false}
          scroll={{
            x: 1200,
            y: earningsData.length > 0 ? height - 340 : undefined
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 400)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSizeOptions: [
              '10',
              '20',
              '50',
              '100',
              '200',
              '300',
              '400',
              '500'
            ],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              console.log({ page, pageSize, filter });
            }
          }}
        />
      </div> */}
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

// const tableWrapperStyles = css`
//   border: 1px solid var(--border-table-color);
//   border-radius: 0.8rem;
// `;

// const tableStyles = css`
//   .ant-table-cell {
//     padding: 0.8rem 1rem !important;
//   }
// `;

// const tableTopStyles = css`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 1.2rem 1.6rem;
// `;

// const actionStyles = css`
//   display: flex;
//   justify-content: flex-end;
//   gap: 1.2rem;
// `;

// const emptyStyles = (height: number) => css`
//   height: ${height}px;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
// `;
