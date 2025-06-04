import { TableColumnsType } from 'antd';
import SearchInput from 'src/cms/components/Search/SearchInput';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import useRequestStore, { FilterRequest } from 'src/store/useRequestStore';
import { useEffect, useState } from 'react';
import { useTableConfig } from 'src/hooks/useTable';
import { Request } from 'src/types/request.type';
import DataTable from 'src/cms/components/Table/DataTable';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { BiDish } from 'react-icons/bi';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import { RequestStatus, RequestType } from 'src/shared/common/enum';
import { MdOutlinePayment } from 'react-icons/md';
import { AiOutlineUser } from 'react-icons/ai';
import BaseButton from 'src/shared/components/Buttons/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import BaseSelect from 'src/shared/components/Core/Select';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { Table, Zone } from 'src/types/table.type';
import useZoneStore from 'src/store/useZoneStore';
import { RequestStatusBadge } from 'src/cms/components/Badge/RequestStatusBadge';
import { NoUndefinedRangeValueType } from 'rc-picker/lib/PickerInput/RangePicker';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import NoData from 'src/cms/components/NoData/NoData';

export default function RequestHistory() {
  const { getQuery } = useUrlQuery();
  const location = useLocation();
  const { fetchRequestHistory, historyRequests, isLoading, historyTotal } = useRequestStore();
  const { fetchZones, zones } = useZoneStore();
  const [prevState] = useState(() => ({
    prevFilters: location.state?.prevFilters || {},
    previousPath: location.state?.previousPath || '/request' // Thêm previousPath
  }));

  const handleBack = () => {
    const searchParams = new URLSearchParams();

    if (prevState.prevFilters) {
      Object.entries(prevState.prevFilters).forEach(([key, value]) => {
        if (value) searchParams.set(key, value.toString());
      });
    }

    // Nếu previousPath là "/request", ta lấy phần sau "/request/" từ location.pathname
    let correctedPath = prevState.previousPath;
    if (correctedPath === '/request') {
      const subPath = location.pathname.replace(/^\/request\//, ''); // Lấy phần sau "/request/"
      correctedPath = `/request/${subPath.split('/')[0]}`; // Chỉ lấy phần đầu tiên (ví dụ: "order" hoặc "staff")
    }

    navigate({
      pathname: correctedPath, // Đường dẫn động
      search: searchParams.toString()
    });
  };

  const [filters, setFilters] = useState<FilterRequest>({
    search: getQuery('search') || undefined,
    type: getQuery('type') || undefined,
    zoneId: getQuery('zoneId') || undefined,
    tableId: getQuery('tableId') || undefined,
    startDate: getQuery('startDate') || undefined,
    endDate: getQuery('endDate') || undefined
  });
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const navigate = useNavigate();

  const { tableProps, resetToFirstPage } = useTableConfig<Request, FilterRequest>({
    data: historyRequests,
    totalItems: historyTotal,
    isLoading,
    fetchData: fetchRequestHistory,
    filters
  });
  useEffect(() => {
    fetchZones();
  }, []);
  // const handleZoneChange = (value: string | number | undefined) => {
  //   handleFiltersChange({
  //     zoneId: value?.toString(),
  //     tableId: undefined
  //   });
  //   setFilteredTables([]);
  // };
  useEffect(() => {
    if (filters.zoneId) {
      const zone = zones.find((z) => z.id === filters.zoneId);
      if (zone) {
        setFilteredTables(zone.tables);
      }
    } else {
      setFilteredTables([]);
    }
  }, [filters.zoneId, zones]);
  // const handleTableChange = (value: string | number | undefined) => {
  //   handleFiltersChange({
  //     tableId: value?.toString()
  //   });
  // };
  const handleFiltersChange = (newFilters: Partial<FilterRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const handleFilterDateRange = (value: NoUndefinedRangeValueType<Dayjs> | null) => {
    const _filters = { ...filters };
    const startDate = value?.[0] ? dayjs(value?.[0]) : undefined;
    _filters.startDate = startDate;
    if (value?.[1]?.toString().includes('17:00:00')) {
      const endDate = value?.[1] ? dayjs(value?.[1]).add(1, 'day').subtract(1, 'second') : undefined;
      _filters.endDate = endDate;
    }
    setFilters(_filters);
  };

  const handleNavigateDetail = (id: string) => {
    navigate(`/request/history/${id}`, {
      state: {
        prevFilters: prevState.prevFilters,
        historyFilters: filters,
        historyPagination: {
          current: tableProps.currentPage,
          pageSize: tableProps.pageSize
        }
      }
    });
  };
  const columns: TableColumnsType<Request> = [
    {
      title: 'Loại yêu cầu ',
      // width: 340,
      render: (value: Request) => (
        <div className='flex items-center'>
          {/* Icon */}
          <div className='text-2xl mr-4'>
            {value.type === RequestType.PAYMENT ? (
              <MdOutlinePayment className='text-success' />
            ) : value.type === RequestType.ORDER ? (
              <BiDish className='text-danger' />
            ) : (
              <AiOutlineUser className='text-primary' />
            )}
          </div>
          <div className='flex-1 flex flex-col'>
            <div className='flex gap-3 truncate '>
              <h3 className='text-md font-semibold min-w-32'>
                {value.type === RequestType.PAYMENT
                  ? 'Yêu cầu thanh toán'
                  : value.type === RequestType.ORDER
                    ? 'Yêu cầu gọi món'
                    : 'Yêu cầu nhân viên'}
              </h3>
              <span className='bg-lightBlue font-bold text-primary text-[10px] px-2 py-1 rounded-full'>
                {capitalizeFirstLetter(dayjs(value.createdAt).fromNow()).replace('tới', 'trước')}
              </span>
            </div>
            <p className='text-sm truncate'>Khách hàng: {value.sessionCustomer?.customer?.name || 'Không rõ'}</p>
          </div>
        </div>
      )
    },
    { title: 'Bàn', render: (value: Request) => (value.table ? `${value.table.name} - ${value.table.zone.name}` : '') },
    {
      title: 'Trạng thái',
      width: 190,
      render: (value: Request) => {
        return RequestStatusBadge(value.status === RequestStatus.REJECTED ? RequestStatus.CANCELED : value?.status);
      }
    },
    {
      title: 'Tác vụ',
      fixed: 'right',
      render: (value: Request) => {
        return <BaseButton onClick={() => handleNavigateDetail(value?.id)}>Xem chi tiết</BaseButton>;
      }
    }
  ];

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

  return (
    <DetailHeader
      title='Lịch sử yêu cầu'
      rightElement={
        <FilterDropdown
          filtersFields={[
            {
              key: 'search',
              label: 'Tìm kiếm',
              type: 'search',
              placeholder: 'Nhập tên khách hàng'
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
      }
      handleBack={handleBack}
    >
      <div>
        <div className='flex flex-wrap lg:justify-end md:justify-start items-center gap-x-4 gap-y-2'></div>
        <DataTable<Request>
          rowKey='id'
          columns={columns}
          {...tableProps}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: <NoData /> }}
        />
      </div>
    </DetailHeader>
  );
}
