import { useEffect, useRef, useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { useTableConfig } from 'src/hooks/useTable';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { Order } from 'src/types/order.type';
import DataTable from 'src/cms/components/Table/DataTable';
import { useLocation, useNavigate } from 'react-router-dom';
import { TableColumnsType } from 'antd/lib';
import SearchInput from 'src/cms/components/Search/SearchInput';
import useOrderStore, { FilterOrder } from 'src/store/useOrderStore';
import { formatDate } from 'src/shared/utils/utils';
import { orderStatus } from 'src/shared/common/constant';
import { Button, Empty, Skeleton, Spin, Tag } from 'antd';
import { OrderStatus } from 'src/shared/common/enum';
import useZoneStore from 'src/store/useZoneStore';
import BaseSelect from 'src/shared/components/Core/Select';
import { Table, Zone } from 'src/types/table.type';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import BaseButton from 'src/shared/components/Buttons/Button';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import CardOrderMobile from './components/CardOrderMobile';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import NoData from 'src/cms/components/NoData/NoData';

export const RequestStatusTag = (status: string) => {
  const StatusTag = ({ color, text }: { color: string; text: string }) => (
    <Tag className='gap-1 mt-1 px-2 items-center justify-center w-fit rounded-full hidden lg:flex' color={color}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current mt-0.5`}></span>
      {text}
    </Tag>
  );

  switch (status) {
    case OrderStatus.PAID:
      return <StatusTag color='green' text='Đã thanh toán' />;
    case OrderStatus.UNPAID:
      return <StatusTag color='red' text='Chưa thanh toán' />;
  }
};

export const RequestEInvoiceStatusTag = (isCreatedEInvoice: boolean) => {
  const EInvoiceStatusTag = ({ color, text }: { color: string; text: string }) => (
    <Tag className='gap-1 mt-1 px-2 items-center justify-center w-fit rounded-full hidden lg:flex' color={color}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current mt-0.5`}></span>
      {text}
    </Tag>
  );

  return isCreatedEInvoice ? (
    <EInvoiceStatusTag color='green' text='Đã tạo HDDT' />
  ) : (
    <EInvoiceStatusTag color='red' text='Chưa tạo HDDT' />
  );
};

const OrderList = () => {
  const location = useLocation();
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { orders, total, isLoading, fetchOrders } = useOrderStore();
  const { fetchZones, zones } = useZoneStore();
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [filters, setFilters] = useState<FilterOrder & { isClearFilterDate?: boolean }>({
    search: getQuery('search') || undefined,
    status: getQuery('status') || undefined,
    zoneId: getQuery('zoneId') || undefined,
    tableId: getQuery('tableId') || undefined,
    startDate: getQuery('startDate') || (getQuery('isClearFilterDate') === 'true' ? undefined : dayjs().startOf('day')),
    endDate: getQuery('endDate') || (getQuery('isClearFilterDate') === 'true' ? undefined : dayjs().endOf('day')),
    isClearFilterDate: getQuery('isClearFilterDate') === 'true' || undefined
  });
  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    if (filters.tableId && zones.length > 0) {
      // Tìm khu vực chứa bàn được chọn
      let found = false;
      for (const zone of zones) {
        const tableExists = zone.tables.some((table) => table.id === filters.tableId);
        if (tableExists) {
          found = true;
          // Tự động cập nhật khu vực nếu chưa được chọn hoặc không đúng
          if (filters.zoneId !== zone.id) {
            handleFiltersChange({ zoneId: zone.id });
          }
          break;
        }
      }

      // Nếu không tìm thấy bàn trong bất kỳ khu vực nào
      if (!found) {
        handleFiltersChange({ tableId: undefined });
      }
    }
  }, [filters.tableId, zones]);

  // lọc danh sách bàn theo khu vực
  useEffect(() => {
    if (filters.zoneId) {
      const zone = zones.find((z) => z.id === filters.zoneId);
      if (zone) {
        setFilteredTables(zone.tables);
        // Kiểm tra xem bàn đã chọn có nằm trong danh sách mới không
        const isTableValid = zone.tables.some((t) => t.id === filters.tableId);
        if (!isTableValid && filters.tableId) {
          handleFiltersChange({ tableId: undefined });
        }
      }
    } else {
      // Nếu không chọn khu vực, hiển thị tất cả bàn
      setFilteredTables(zones.flatMap((z) => z.tables));
    }
  }, [filters.zoneId, zones]);

  const [filteredZones, setFilteredZones] = useState<Zone[]>(zones);

  useEffect(() => {
    setFilteredZones(zones);
  }, [zones]);

  const { tableProps, resetToFirstPage } = useTableConfig<Order, FilterOrder>({
    data: orders,
    totalItems: total,
    isLoading,
    fetchData: fetchOrders,
    filters
  });

  const columns: TableColumnsType<Order> = [
    {
      title: 'STT',
      width: 60,
      render: (_text, _record, index) => (tableProps.currentPage - 1) * tableProps.pageSize + index + 1
    },
    { title: 'Mã đơn hàng', dataIndex: 'code' },
    { title: 'Bàn', dataIndex: 'tableName' },
    { title: 'Khu vực', dataIndex: 'zoneName' },
    {
      title: 'Ngày',
      render: (value: Order) => {
        return <div>{formatDate(value.createdAt, false)}</div>;
      }
    },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    {
      title: 'Trạng thái thanh toán',
      render: (value: Order) => {
        return <div>{RequestStatusTag(value?.status)}</div>;
      }
    },
    {
      title: 'Trạng thái HDDT',
      render: (value: Order) => {
        return <div>{RequestEInvoiceStatusTag(!!value?.isCreatedEInvoice)}</div>;
      }
    }
  ];

  const handleFiltersChange = (newFilters: Partial<FilterOrder>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const filterButtonsConfig = [
    { label: 'Tất cả', status: undefined },
    { label: 'Đã thanh toán', status: OrderStatus.PAID },
    { label: 'Chưa thanh toán', status: OrderStatus.UNPAID }
  ];

  const renderFilterButtons = () =>
    filterButtonsConfig.map(({ label, status }) => (
      <BaseButton
        key={status || 'all'}
        variant={filters.status === status ? 'solid' : 'outlined'}
        onClick={() => handleFiltersChange({ status })}
      >
        {label}
      </BaseButton>
    ));

  const handleFilterDateRange = (value: NoUndefinedRangeValueType<Dayjs> | null) => {
    const _filters = { ...filters };
    const startDate = value?.[0] ? dayjs(value?.[0]) : undefined;
    _filters.startDate = startDate;
    if (value?.[1]?.toString().includes('17:00:00')) {
      const endDate = value?.[1] ? dayjs(value?.[1]).add(1, 'day').subtract(1, 'second') : undefined;
      _filters.endDate = endDate;
    }
    setFilters(_filters);
    resetToFirstPage();
  };

  const { data, loading, containerRef, sentinelRef } = useInfiniteScroll<Order>(fetchOrders, filters);
  return (
    <MainHeader
      title={
        <div className='flex items-center gap-[6.8px]'>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>Quản lý đơn hàng</h2>
          <div className='flex items-center gap-[6.8px] lg:hidden'>
            <BaseSelect
              className='w-[150px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Đã thanh toán', value: 'PAID' },
                { label: 'Chưa thanh toán', value: 'UNPAID' }
              ]}
              value={filters.status || 'all'}
              onChange={(value: string) => handleFiltersChange({ status: value === 'all' ? undefined : value })}
            ></BaseSelect>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm theo mã đơn hàng'
                },
                {
                  key: 'tableId',
                  options: filteredTables.map((item) => ({ value: item.id, label: item.name })),
                  label: 'Bàn',
                  type: 'select',
                  placeholder: 'Chọn bàn'
                },
                {
                  key: 'zoneId',
                  label: 'Khu vực',
                  type: 'select',
                  options: filteredZones.map((zone) => ({ label: zone.name, value: zone.id })),
                  placeholder: 'Chọn khu vực'
                },
                {
                  label: 'Thời gian',
                  type: 'date-range'
                }
              ]}
              filters={filters}
              setFilters={(newFilters) => {
                setFilters((prev) => ({ ...prev, ...newFilters }));
                resetToFirstPage();
              }}
              placement='bottomCenter'
            />
          </div>
        </div>
      }
    >
      <h2 className='sm:hidden text-[16px] font-bold '>Quản lý đơn hàng</h2>
      <div className='relative flex-wrap items-center justify-between gap-4 mb-6 hidden lg:flex w-s'>
        {/* Buttons */}
        <div className='w-full flex flex-wrap justify-between gap-2'>
          <div className='flex flex-wrap gap-2'>{renderFilterButtons()}</div>
          <FilterDropdown
            filtersFields={[
              {
                key: 'search',
                label: 'Tìm kiếm',
                type: 'search',
                placeholder: 'Tìm kiếm theo mã đơn hàng'
              },
              {
                key: 'tableId',
                options: filteredTables.map((item) => ({ value: item.id, label: item.name })),
                label: 'Bàn',
                type: 'select',
                placeholder: 'Chọn bàn'
              },
              {
                key: 'zoneId',
                label: 'Khu vực',
                type: 'select',
                options: filteredZones.map((zone) => ({ label: zone.name, value: zone.id })),
                placeholder: 'Chọn khu vực'
              },
              {
                label: 'Thời gian',
                type: 'date-range'
              }
            ]}
            filters={filters}
            setFilters={(newFilters) => {
              setFilters((prev) => ({ ...prev, ...newFilters }));
              resetToFirstPage();
            }}
            className='w-full'
          />
        </div>
      </div>
      <div
        className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-90px)] mt-6'
        ref={containerRef}
      >
        {!data?.length && <NoData />}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {data?.length > 0 &&
            data?.map((item: Order, index: number) => {
              return (
                <CardOrderMobile
                  key={index}
                  {...item}
                  isCreatedEInvoice={!!item.isCreatedEInvoice}
                  zoneAndtable={`${item?.zoneName} - ${item?.tableName}`}
                  onClick={() => {
                    navigate(`${item.id}${location?.search}`);
                  }}
                />
              );
            })}
        </div>
        <div className='flex justify-center items-center'>
          <Spin spinning={loading} />
        </div>
        <div ref={sentinelRef} />
      </div>
      <div className='hidden lg:block'>
        <DataTable<Order>
          rowKey='id'
          columns={columns}
          {...tableProps}
          scroll={{ x: 'max-content' }}
          onRow={(record) => {
            return {
              onClick: () => {
                navigate(`${record.id}${location?.search}`);
              }
            };
          }}
          locale={{ emptyText: <NoData /> }}
        />
      </div>
    </MainHeader>
  );
};

export default OrderList;
