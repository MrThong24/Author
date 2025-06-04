import { useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { useTableConfig } from 'src/hooks/useTable';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import DataTable from 'src/cms/components/Table/DataTable';
import { TableColumnsType } from 'antd/lib';
import SearchInput from 'src/cms/components/Search/SearchInput';

import { FilterCustomer, useCustomerStore } from 'src/store/useCustomerStore';
import { Customers } from 'src/types/customer.type';
import { formatDate } from 'src/shared/utils/utils';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import { Empty, Spin } from 'antd';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import useMediaQuery from 'src/hooks/useMediaQuery';
import CardCustomer from './components/CardCustomer';
import NoData from 'src/cms/components/NoData/NoData';

const Customer = () => {
  const { getQuery } = useUrlQuery();
  const { fetchCustomers, isLoading, total, customers } = useCustomerStore();
  const [filters, setFilters] = useState<FilterCustomer>({
    search: getQuery('search') || undefined
  });
  const {
    data: dataMobile,
    loading,
    containerRef,
    sentinelRef
  } = useInfiniteScroll<Customers>(fetchCustomers, filters);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { tableProps, resetToFirstPage } = useTableConfig<Customers, FilterCustomer>({
    data: customers,
    totalItems: total,
    isLoading,
    fetchData: fetchCustomers,
    filters
  });

  const columns: TableColumnsType<Customers> = [
    {
      title: 'STT',
      width: 60,
      render: (_text, _record, index) => (tableProps.currentPage - 1) * tableProps.pageSize + index + 1
    },
    { title: 'Tên khách hàng', dataIndex: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    {
      title: 'Thời gian truy cập',
      render: (value: Customers) => {
        return <div>{formatDate(value.accessTime, true)}</div>;
      }
    }
  ];

  const handleFiltersChange = (newFilters: Partial<FilterCustomer>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  return (
    <MainHeader
      title={
        <div className='flex items-center gap-[6.8px]'>
          <h2 className='text-[16px] lg:text-xl xl:text-2xl'>Quản lý khách hàng</h2>
          <div className='flex items-center gap-[6.8px] lg:hidden'>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm khách hàng...'
                }
              ]}
              filters={filters}
              setFilters={setFilters}
              placement='bottomCenter'
            />
          </div>
        </div>
      }
    >
      {!isMobile && (
        <div className='relative hidden lg:flex flex-wrap items-center justify-between gap-4 mb-6'>
          <div className='flex items-center gap-2 flex-1'>
            <SearchInput
              defaultValue={filters.search}
              onSearch={(value) => handleFiltersChange({ search: value })}
              placeholder='Tìm kiếm khách hàng...'
              className='max-w-96 flex-1'
            />
          </div>
        </div>
      )}
      <div className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-94px)]' ref={containerRef}>
        {!dataMobile?.length && !loading && <NoData className='lg:hidden' />}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pb-2'>
          {dataMobile?.map((customer: Customers, index) => <CardCustomer customer={customer} index={index} />)}
        </div>
        <div className='flex justify-center items-center'>
          <Spin spinning={loading} />
        </div>
        <div ref={sentinelRef} />
      </div>
      <DataTable<Customers>
        className='hidden lg:block'
        rowKey='id'
        columns={columns}
        {...tableProps}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <NoData /> }}
      />
    </MainHeader>
  );
};

export default Customer;
