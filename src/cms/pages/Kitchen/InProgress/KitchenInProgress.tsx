import { useEffect, useRef, useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import BaseButton from 'src/shared/components/Buttons/Button';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import RequestInProgress from './Tabs/RequestInProgress';
import TableInProgress from './Tabs/TableInProgress';
import AllProgress from './Tabs/AllProgress';
import BaseSelect from 'src/shared/components/Core/Select';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { TablePaginationProps } from 'src/types/utils.type';
import useZoneStore from 'src/store/useZoneStore';
import { Table, Zone } from 'src/types/table.type';
import { notification } from 'antd';
import { disconnectSocket, initializeSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import { RoleType, SocketEnum } from 'src/shared/common/enum';
import useAuthStore from 'src/store/authStore';
import BaseTabs from 'src/cms/components/Tabs';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import useAudioDebounce from 'src/hooks/useAudioDebounce';
import { clearLS } from 'src/shared/utils/auth';
import useStoreStore from 'src/store/useStoreStore';
import { CgArrowsExchange } from 'react-icons/cg';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { LuStore } from 'react-icons/lu';
import { useReactToPrint } from 'react-to-print';
import { AiOutlinePrinter } from 'react-icons/ai';
import KitchenTickets from './components/KitchenTickets';
import NoData from 'src/cms/components/NoData/NoData';

export default function KitchenInProgress() {
  const { getQuery, setQuery } = useUrlQuery();
  const {
    total,
    fetchRequestInProgress,
    fetchTableInProgress,
    fetchAllInProgress,
    requestsProductInProgress,
    dataAllInProgress,
    dataTableInProgress
  } = useRequestProductStore();
  const [activeTab, setActiveTab] = useState<'table' | 'request' | 'all'>(
    (getQuery('activeTab') as 'table' | 'request' | 'all') ?? 'request'
  );
  const { kitchenSettings, fetchKitchenSettings } = useStoreStore();
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [valueKitchen, setValueKitchen] = useState<string>('');
  const [modalChooseKitchen, setModalChooseKitchen] = useState<boolean>(false);
  const { playAudioDebounced } = useAudioDebounce(5000);
  const { currentUser, chooseKitchen, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const handleTabClick = (tab: string) => {
    setActiveTab(tab as 'table' | 'request' | 'all');
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
    fetchKitchenSettings();
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

  const fetchKitchenData = async (params: FilterKitchen & { page: number; limit: number }) => {
    const { page, limit, ...filterParams } = params;
    if (activeTab === 'request') {
      await fetchRequestInProgress(filterParams);
    } else if (activeTab === 'table') {
      await fetchTableInProgress(filterParams);
    } else if (activeTab === 'all') {
      await fetchAllInProgress(filterParams);
    }
  };

  useEffect(() => {
    if (!currentUser?.kitchen) {
      return;
    }
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

    fetchKitchenData(params);
    hasInitialFetch.current = true;
  }, [filters, pagination, activeTab, currentUser]);

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

  const handleLogout = () => {
    clearLS();
    window.location.reload();
  };

  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: () => {
          if (
            currentUser?.currentUserStore?.role !== RoleType.CHEF ||
            currentUser?.currentUserStore?.store?.kitchenDisabled
          ) {
            return;
          }
          playAudioDebounced(audioRef.current.kitchen);
        }
      },
      {
        event: SocketEnum.KITCHEN_DISABLED,
        callback: () => {
          if (currentUser?.currentUserStore?.role === RoleType.CHEF) {
            handleLogout();
            notification.error({
              message: 'Lỗi xác thực',
              description: 'Cửa hàng này đã tắt sử dụng bếp'
            });
          }
        }
      }
    ],
    []
  );

  useEffect(() => {
    audioRef.current = {
      kitchen: new Audio('/sounds/kitchen.mp3')
    };

    audioRef.current.kitchen.volume = 0.5;

    return () => {
      Object.values(audioRef.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      audioRef.current = {};
    };
  }, []);

  const handleChooseKitchen = async () => {
    await chooseKitchen({ kitchenId: valueKitchen });
    disconnectSocket();
    initializeSocket();
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize
    };
    await fetchKitchenData(params);
    setModalChooseKitchen(false);
  };

  useEffect(() => {
    if (currentUser?.kitchen) {
      setModalChooseKitchen(false);
      setValueKitchen(currentUser.kitchen.id);
    } else if (kitchenSettings?.length === 1) {
      const singleKitchenId = kitchenSettings[0].id;
      setValueKitchen(singleKitchenId);
      chooseKitchen({ kitchenId: singleKitchenId }).then(() => {
        disconnectSocket();
        initializeSocket();
        const params = {
          ...filters,
          page: pagination.current,
          limit: pagination.pageSize
        };
        fetchKitchenData(params);
      });

      setModalChooseKitchen(false);
    } else if (kitchenSettings?.length > 1) {
      setModalChooseKitchen(true);
    }
  }, [currentUser, kitchenSettings]);

  const multiTableRef = useRef(null);
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Bếp'
  });

  const handlePrintMultiTable = useReactToPrint({
    contentRef: multiTableRef,
    documentTitle: 'Bếp',
    pageStyle: `
      @media print {
        .page-break-after {
          page-break-after: always;
        }
      }
    `
  });

  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3 '>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>{currentUser?.kitchen?.name}</h2>
          <div className='xl:hidden flex flex-1 items-center gap-3'>
            <BaseSelect
              className='w-[150px] !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
              value={activeTab}
              onChange={handleTabClick}
              options={[
                { value: 'request', label: 'Theo món' },
                { value: 'table', label: 'Theo bàn' },
                { value: 'all', label: 'Tất cả' }
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
              icon={<AiOutlinePrinter size={20} className='mt-1' />}
              className='rounded-md px-4 py-2'
              disabled={
                (activeTab === 'request' && !requestsProductInProgress?.length) ||
                (activeTab === 'table' && !dataTableInProgress?.length) ||
                (activeTab === 'all' && !dataAllInProgress?.length)
              }
              onClick={() => {
                activeTab === 'request' && handlePrint();
                activeTab === 'table' && handlePrintMultiTable();
                activeTab === 'all' && handlePrint();
              }}
            ></BaseButton>
            <BaseButton
              icon={<CgArrowsExchange size={24} className='mt-1' />}
              className='rounded-md px-4 py-2'
              onClick={() => setModalChooseKitchen(true)}
            ></BaseButton>
            <BaseButton
              disabled={!currentUser?.kitchen}
              icon={<ClockCircleOutlined />}
              className='rounded-md px-4 py-2 hidden mbsm:flex'
              onClick={() => navigate('history')}
            />
          </div>
        </div>
      }
    >
      <div className='flex items-center gap-2 justify-between mb-4 mbsm:mb-0'>
        <h2 className='sm:hidden text-[16px] font-bold '>{currentUser?.kitchen?.name}</h2>
        <BaseButton
          disabled={!currentUser?.kitchen}
          icon={<ClockCircleOutlined />}
          className='rounded-md px-4 py-2 mbsm:hidden flex'
          onClick={() => navigate('history')}
        />
      </div>
      <div className='xl:flex hidden flex-row justify-between items-center mb-2'>
        <BaseTabs
          tabs={[
            { key: 'request', label: 'Theo món' },
            { key: 'table', label: 'Theo bàn' },
            { key: 'all', label: 'Tất cả' }
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
            icon={<CgArrowsExchange size={20} className='mt-1' />}
            className='rounded-md px-4 py-2'
            onClick={() => setModalChooseKitchen(true)}
          >
            Chuyển bếp
          </BaseButton>
          <BaseButton
            icon={<AiOutlinePrinter size={20} className='mt-1' />}
            className='rounded-md px-4 py-2'
            onClick={() => {
              activeTab === 'request' && handlePrint();
              activeTab === 'table' && handlePrintMultiTable();
              activeTab === 'all' && handlePrint();
            }}
            disabled={
              (activeTab === 'request' && !requestsProductInProgress?.length) ||
              (activeTab === 'table' && !dataTableInProgress?.length) ||
              (activeTab === 'all' && !dataAllInProgress?.length)
            }
          >
            In tất cả
          </BaseButton>
          <BaseButton
            disabled={!currentUser?.kitchen}
            icon={<ClockCircleOutlined />}
            className='rounded-md px-4 py-2'
            onClick={() => navigate('history')}
          >
            Xem lịch sử
          </BaseButton>
        </div>
      </div>

      {activeTab === 'request' && <RequestInProgress filters={filters} />}
      {activeTab === 'table' && <TableInProgress filters={filters} />}
      {activeTab === 'all' && <AllProgress filters={filters} />}

      <ModalConfirm
        isOpen={modalChooseKitchen}
        title='Chọn bếp'
        onClose={() => setModalChooseKitchen(false)}
        onConfirm={handleChooseKitchen}
        icon={<LuStore size={24} />}
        loading={isLoading}
      >
        <BaseSelect
          options={kitchenSettings?.map((kitchen) => ({
            value: kitchen.id,
            label: kitchen.name
          }))}
          defaultValue={currentUser?.kitchen?.id || null}
          placeholder='Chọn bếp'
          optionFilterProp='name'
          showSearch
          notFoundContent={<NoData />}
          onChange={(value) => {
            setValueKitchen(value);
          }}
          className='w-full mb-6 text-start'
        />
      </ModalConfirm>
      <div className='hidden'>
        {activeTab === 'request' && (
          <div className='w-full' ref={contentRef}>
            <KitchenTickets data={requestsProductInProgress} type={activeTab} printType='multi' />
          </div>
        )}
        {activeTab === 'all' && (
          <div className='w-full' ref={contentRef}>
            <KitchenTickets data={dataAllInProgress} type={activeTab} printType='multi' />
          </div>
        )}
        {activeTab === 'table' && (
          <div ref={multiTableRef} className='w-full'>
            <div className='flex flex-col gap-4 w-full'>
              {!!dataTableInProgress.length &&
                dataTableInProgress.map((table) => {
                  return (
                    <div key={table.id}>
                      {table.requests.map((request, index) => {
                        return (
                          <div key={request.id} className='print-content page-break-after'>
                            <KitchenTickets
                              data={request}
                              type={activeTab}
                              printType='multi'
                              index={index}
                              tableName={`${table?.zone?.name} - ${table?.name}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </MainHeader>
  );
}
