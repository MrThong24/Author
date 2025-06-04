import { useEffect, useRef, useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import BaseButton from 'src/shared/components/Buttons/Button';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RequestPending from './Tabs/RequestPending';
import TableRequestPending from './Tabs/TableRequestPending';
import BaseSelect from 'src/shared/components/Core/Select';
import { Table, Zone } from 'src/types/table.type';
import useZoneStore from 'src/store/useZoneStore';
import { TablePaginationProps } from 'src/types/utils.type';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import BaseTabs from 'src/cms/components/Tabs';

export default function KitchenPending() {
  const { getQuery, setQuery } = useUrlQuery();
  const { total, fetchRequestComplete, fetchTableComplete } = useRequestProductStore();
  const [activeTab, setActiveTab] = useState<'table' | 'request'>(
    (getQuery('activeTab') as 'table' | 'request') ?? 'request'
  );
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const navigate = useNavigate();
  const handleTabClick = (tab: string) => {
    setActiveTab(tab as 'table' | 'request');
    setQuery('activeTab', tab);
  };
  const { fetchZones, zones } = useZoneStore();
  const [pagination, setPagination] = useState<TablePaginationProps>({
    current: Number(getQuery('page')) || 1,
    pageSize: Number(getQuery('limit')) || 10,
    total: total
  });

  const [filters, setFilters] = useState<FilterKitchen>({
    search: getQuery('search') ?? undefined, // Sử dụng nullish coalescing
    zoneId: getQuery('zoneId') ?? undefined,
    tableId: getQuery('tableId') ?? undefined
  });
  const hasInitialFetch = useRef(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const resetToFirstPage = () => {
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
    setQuery('page', '1');
  };

  useEffect(() => {
    hasInitialFetch.current = false;
  }, [filters, activeTab]);

  useEffect(() => {
    if (hasInitialFetch.current) {
      return;
    }
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize
    };

    type ParamKeys = keyof typeof params;
    Object.keys(params).forEach((key) => {
      if (key in params) {
        setQuery(key, params[key as ParamKeys]?.toString());
      }
    });

    const { page, limit, ...filterParams } = params;

    if (activeTab === 'request') {
      fetchRequestComplete(filterParams);
    } else {
      fetchTableComplete(filterParams);
    }
    hasInitialFetch.current = true;
  }, [filters, pagination, activeTab]); // Thêm `activeTab` vào dependency array

  const handleFiltersChange = (newFilters: Partial<FilterKitchen>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
    setQuery('page', '1');
  };

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
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>Yêu cầu chờ phục vụ</h2>
          <div className='xl:hidden flex flex-1 items-center gap-3'>
            <BaseSelect
              className='w-[150px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
              value={activeTab}
              onChange={handleTabClick}
              options={[
                {
                  value: 'request',
                  label: 'Theo yêu cầu'
                },
                {
                  value: 'table',
                  label: 'Theo bàn'
                }
              ]}
            />
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm'
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
                  options: filteredZones.map((item) => ({ value: item.id, label: item.name })),
                  label: 'Khu vực',
                  type: 'select',
                  placeholder: 'Chọn khu vực'
                }
              ]}
              filters={filters}
              setFilters={setFilters}
              className='w-full'
            />
            <BaseButton
              icon={<ClockCircleOutlined />}
              className='rounded-md px-4 py-2 hidden mbsm:flex'
              onClick={() => navigate('history')}
            />
          </div>
        </div>
      }
    >
      <div className='flex items-center gap-2 justify-between mb-4 mbsm:mb-0'>
        <h2 className='sm:hidden text-[16px] font-bold '>Yêu cầu chờ phục vụ</h2>
        <BaseButton
          icon={<ClockCircleOutlined />}
          className='rounded-md px-4 py-2 mbsm:hidden flex'
          onClick={() => navigate('history')}
        />
      </div>
      <div className='xl:flex hidden flex-row justify-between items-center mb-2'>
        <BaseTabs
          tabs={[
            {
              key: 'request',
              label: 'Theo yêu cầu'
            },
            {
              key: 'table',
              label: 'Theo bàn'
            }
          ]}
          activeKey={activeTab}
          onChange={handleTabClick}
        />
        <div className='flex items-center gap-2'>
          <FilterDropdown
            filtersFields={[
              {
                key: 'search',
                label: 'Tìm kiếm',
                type: 'search',
                placeholder: 'Tìm kiếm'
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
                options: filteredZones.map((item) => ({ value: item.id, label: item.name })),
                label: 'Khu vực',
                type: 'select',
                placeholder: 'Chọn khu vực'
              }
            ]}
            filters={filters}
            setFilters={setFilters}
            className='w-full'
          />
          <BaseButton
            icon={<ClockCircleOutlined />}
            className='rounded-md px-4 py-2'
            onClick={() => navigate('history')}
          >
            Xem lịch sử
          </BaseButton>
        </div>
      </div>
      {activeTab === 'request' && <RequestPending filters={filters} activeTab={activeTab} />}
      {activeTab === 'table' && <TableRequestPending filters={filters} />}
    </MainHeader>
  );
}
