import { useEffect, useMemo, useRef, useState } from 'react';
import useTableStore, { FilterTables } from 'src/store/useTableStore';
import SearchInput from 'src/cms/components/Search/SearchInput';
import BaseButton from 'src/shared/components/Buttons/Button';
import useZoneStore from 'src/store/useZoneStore';
import BaseSelect from 'src/shared/components/Core/Select';
import { MdOutlineCancel, MdSearch } from 'react-icons/md';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import ManageZone from './components/ManageZone';
import DataTable from 'src/cms/components/Table/DataTable';
import { Table, TableToPrint } from 'src/types/table.type';
import { Empty, Modal, TableColumnsType } from 'antd';
import { EditOutlined, PrinterOutlined } from '@ant-design/icons';
import ManageTable from './ManageTable/ManageTable';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import TableCard from './components/TableCard';
import { tableStatus } from 'src/shared/common/constant';
import BaseSwitch from 'src/shared/components/Core/Switch';
import TableQrCode from './components/TableQrCode';
import { RoleType, SocketEnum, TableStatus } from 'src/shared/common/enum';
import ModalTableOrder from './components/ModalTableOrder';
import useOrderStore from 'src/store/useOrderStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import useAuthStore from 'src/store/authStore';
import useEmployeeStore from 'src/store/useEmployeeStore';
import { IoGridOutline } from 'react-icons/io5';
import { LuLayoutList, LuQrCode } from 'react-icons/lu';
import { useTheme } from 'src/provider/ThemeContext';
import { useReactToPrint } from 'react-to-print';
import TableQrCodeToPrint from './components/TableQrCodeToPrint';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import TableQrCodePaymentToPrint from './components/TableQrCodePaymentToPrint';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { IoMdClose } from 'react-icons/io';
import { BsFileEarmarkArrowDown } from 'react-icons/bs';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import { FilterConfig } from '../../components/Filter/FilterDropdown';
import TableCardRow from './components/TableCardRow';
import { BiSelectMultiple } from 'react-icons/bi';
import NoData from 'src/cms/components/NoData/NoData';
import * as bpac from 'src/assets/printer/bpac.js';
import { bpacLogo } from 'src/assets/images';

const TableList = () => {
  const { theme } = useTheme();
  const [openManageZone, setOpenManageZone] = useState<boolean>(false);
  const [openManageTable, setOpenManageTable] = useState<boolean>(false);
  const {
    tables,
    isLoading: isTableLoading,
    fetchTables,
    total,
    deleteTables,
    exportTableToPrint,
    setTables,
    getTableDataToPrint
  } = useTableStore();
  const { zones, isLoading: isZonesLoading, fetchZones } = useZoneStore();
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const { isLoading: isEmployeeLoading, employees, getEmployeeByStore } = useEmployeeStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tablesMap, setTablesMap] = useState<Record<string, Table>>({});
  const multiTableRef = useRef(null);
  const multiTablePaymentRef = useRef(null);
  const singleTableRef = useRef(null);
  const { getQuery, setQuery } = useUrlQuery();
  const defaultFilters = {
    search: '',
    zoneId: null,
    status: null,
    userIds: null
  };
  const [filters, setFilters] = useState<FilterTables>({
    search: getQuery('search') || '',
    zoneId: getQuery('zoneId') || null,
    status: getQuery('status') || null,
    userIds: getQuery('userIds') ? getQuery('userIds')!.split(',') : null
  });
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [filterTables, setFilterTables] = useState<Array<Table>>([]);
  const [switchView, setSwitchView] = useState<boolean>(false);
  const [openPrintModal, setOpenPrintModal] = useState<boolean>(false);
  const [openTableOrderModal, setOpenTableOrderModal] = useState<boolean>(false);
  const [openBar, setOpenBar] = useState<boolean>(false);
  const { isLoading: isOrderLoading, createOrder } = useOrderStore();
  const [isOpenPrintQrAndPaymentQRModal, setIsOpenPrintQrAndPaymentQRModal] = useState(false);

  const isMaxLgScreen = useMediaQuery('(max-width: 1023px)');
  // const isMaxMdScreen = useMediaQuery('(max-width: 767px)');
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const hasPermission = useMemo(
    () =>
      currentUser?.currentUserStore?.role === RoleType.MANAGER ||
      currentUser?.currentUserStore?.role === RoleType.STORE_OWNER,
    [currentUser?.currentUserStore?.role]
  );
  const [dataToPrint, setDataToPrint] = useState<TableToPrint[]>([]);
  const handlePrintMultiTable = useReactToPrint({
    contentRef: multiTableRef,
    documentTitle: 'QR bàn',
    pageStyle: `
      @media print {
        @page {
          size: 36mm auto;
          margin: 0;
        }
        .page-break-after {
          page-break-after: always;
        }
        .print-content {
          height: 38mm;
        }
      }
    `
  });

  const handlePrintSingleTable = useReactToPrint({
    contentRef: singleTableRef,
    documentTitle: 'QR bàn',
    pageStyle: `
      @media print {
        @page {
          size: 36mm auto;
          margin: 0;
        }
        .page-break-after {
          page-break-after: always;
        }
        .print-content {
          height: 38mm;
        }
      }
    `
  });

  const handlePrintMultiTablePayment = useReactToPrint({
    contentRef: multiTablePaymentRef,
    documentTitle: 'QR bàn',
    pageStyle: `
      @media print {
        @page {
          size: landscape;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .print-content {
          height: 36mm;
          min-height: 36mm;
          max-height: 36mm;
          overflow: hidden;
        }
        .qr-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    `
  });

  const handlePrintBpac = async (ids?: string[]) => {
    const dataToPrint = await getTableDataToPrint(ids?.length ? ids : selectedRowKeys, window.location.origin);
    if (!bpac.IsExtensionInstalled()) {
      const agent = window.navigator.userAgent.toLowerCase();
      const isedge = agent.indexOf('edg') !== -1;
      if (isedge)
        window.open(
          'https://microsoftedge.microsoft.com/addons/detail/brother-bpac-extension/kmopihekhjobijiipnloimfdgjddbnhg',
          '_blank'
        );
      const ischrome = agent.indexOf('chrome') !== -1 && agent.indexOf('opr') === -1;
      if (ischrome) window.open('https://chrome.google.com/webstore/detail/ilpghlfadkjifilabejhhijpfphfcfhb', '_blank');
      return;
    }

    const objDoc = bpac.IDocument;
    const opened = await objDoc.Open(currentUser?.currentUserStore?.store?.bPacTemplatePath);
    if (!opened) {
      alert('Không thể mở template');
      return;
    }

    try {
      objDoc.StartPrint('', 0);

      for (const item of dataToPrint) {
        const table = await objDoc.GetObject('table');
        table.Text = item.tableName;

        const zone = await objDoc.GetObject('zone');
        zone.Text = item.zoneName;

        const tableQR = await objDoc.GetObject('tableQR');
        tableQR.Text = item.qrCodeOrder;

        const paymentQR = await objDoc.GetObject('paymentQR');
        paymentQR.Text = item.qrCodePayment;

        await objDoc.PrintOut(1, 0);
      }

      objDoc.EndPrint();
    } catch (err) {
      console.error('Lỗi khi in:', err);
    } finally {
      await objDoc.Close();
    }
  };

  const handleGetTableDataToPrint = async (ids?: string[]) => {
    const dataToPrint = await getTableDataToPrint(ids?.length ? ids : selectedRowKeys, window.location.origin);
    setDataToPrint(dataToPrint);
    setTimeout(() => {
      handlePrintMultiTablePayment();
    }, 200);
  };

  const handlePrint = () => {
    if (!bpac.IsExtensionInstalled()) handleGetTableDataToPrint();
    else setIsOpenPrintQrAndPaymentQRModal(true);
  };

  const handleExportTableToPrint = () => {
    exportTableToPrint(selectedRowKeys, window.location.origin);
  };

  useEffect(() => {
    fetchZones();
    fetchTables();
    if (hasPermission) getEmployeeByStore();
  }, []);

  useEffect(() => {
    if (tables.length) {
      setTablesMap(
        tables.reduce(
          (acc, table) => {
            acc[table.id] = table;
            return acc;
          },
          {} as Record<string, Table>
        )
      );
    }
  }, [tables]);

  useMultiSocketEvents(
    [
      {
        event: SocketEnum.TABLE_OCCUPIED,
        callback: (updatedTable: { id: string; status: TableStatus }) => {
          setTables((prevTables) =>
            prevTables.map((table) =>
              table.id === updatedTable.id ? { ...table, status: updatedTable.status } : table
            )
          );
        }
      },
      {
        event: SocketEnum.TABLE_EMPTY,
        callback: (updatedTable: { id: string; status: TableStatus }) => {
          setTables((prevTables) =>
            prevTables.map((table) =>
              table.id === updatedTable.id
                ? {
                    ...table,
                    status: updatedTable.status,
                    pendingRequestsCount: 0
                  }
                : table
            )
          );
        }
      },
      {
        event: SocketEnum.REQUEST_NEW,
        callback: (newRequest: { table: { id: string } }) => {
          setTables((prevTables) =>
            prevTables.map((table) =>
              table.id === newRequest.table.id
                ? {
                    ...table,
                    pendingRequestsCount: (table.pendingRequestsCount || 0) + 1
                  }
                : table
            )
          );
        }
      },
      {
        event: SocketEnum.REQUEST_OTHER_CONFIRMED,
        callback: (newRequest: { table: { id: string } }) => {
          setTables((prevTables) =>
            prevTables.map((table) =>
              table.id === newRequest.table.id
                ? {
                    ...table,
                    pendingRequestsCount: Math.max((table.pendingRequestsCount || 0) - 1, 0)
                  }
                : table
            )
          );
        }
      }
    ],
    []
  );

  const handleFilter = () => {
    Object.keys(filters).forEach((key) => {
      setQuery(key, filters[key as keyof FilterTables]?.toString());
    });
    const { search, zoneId, status, userIds } = filters;
    let _tables: Array<Table> = [...tables];
    if (search) {
      _tables = _tables.filter((item) => item.name.toLowerCase().trim().includes(search.toLowerCase().trim()));
    }
    if (status) {
      _tables = _tables.filter((item) => item.status === status);
    }
    if (zoneId) {
      _tables = _tables.filter((item) => item.zoneId === zoneId);
    }
    if (userIds?.length) {
      _tables = _tables.filter((item) => !!item?.tableUsers?.find((tableUser) => userIds.includes(tableUser.userId)));
    }
    setFilterTables(_tables);
  };
  useEffect(() => {
    handleFilter();
  }, [tables, filters]);

  const handleStatusFilter = (status: TableStatus | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: prevFilters.status === status ? null : status // Bấm lần nữa để bỏ lọc
    }));
  };

  const columns: TableColumnsType<Table> = [
    { title: 'Tên bàn', dataIndex: 'name' },
    { title: 'Khu vực', render: (value: Table) => value?.zone?.name || '' },
    {
      title: 'Trạng thái',
      render: (value) =>
        value.status === TableStatus.OCCUPIED ? (
          <BaseButton
            variant='filled'
            className='px-1 py-0.5 md:px-3 md:py-1 text-primary bg-primary-50 rounded-full flex items-center gap-x-2 pointer-events-none'
          >
            <div>Đang sử dụng</div>
          </BaseButton>
        ) : (
          <div className='w-fit bg-[#F3F4F6] text-[#4B5563] px-1 py-0.5 md:px-3 md:py-1 rounded-lg flex items-center gap-x-2'>
            <div>Bàn trống</div>
          </div>
        )
    },
    { title: 'Yêu cầu chưa xử lý', align: 'center', dataIndex: 'pendingRequestsCount' },

    hasPermission && {
      fixed: 'right',
      title: 'Tác vụ',
      width: 100,
      render: (value: Table) => (
        <div className='flex gap-x-2'>
          <BaseButton
            className={`w-[44px] h-[34px] rounded-md overflow-hidden`}
            onClick={() => {
              setOpenManageTable(true);
              setCurrentTable(value);
            }}
            variant='filled'
          >
            <EditOutlined className='text-primary text-[20px] font-bold' />
          </BaseButton>
          <BaseButton
            className={`rounded-md overflow-hidden`}
            onClick={() => {
              setCurrentTable(value);
              setOpenPrintModal(true);
            }}
            variant='filled'
          >
            <LuQrCode className='text-primary text-[20px] font-bold' />
          </BaseButton>
        </div>
      )
    }
  ].filter(Boolean);

  const handleFiltersChange = (newFilters: Partial<FilterTables>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // resetToFirstPage();
  };

  const handleDeleteSuccess = () => {
    handleFiltersChange(defaultFilters);
  };

  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSelectCheckboxTable = (id: string, checked: boolean) => {
    const _selectedRowKeys = [...selectedRowKeys];
    if (!checked) {
      setSelectedRowKeys(_selectedRowKeys.filter((item) => item !== id));
    } else setSelectedRowKeys([..._selectedRowKeys, id]);
  };

  const zoneOptions = useMemo(() => {
    return zones?.map((zone) => ({
      label: zone.name,
      value: zone.id
    }));
  }, [zones]);
  const handleDeleteTables = async () => {
    try {
      await deleteTables(selectedRowKeys);
      setOpenDeleteModal(false);
      setSelectedRowKeys([]);
      setFilters({ ...filters });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClickComplete = (table: Table) => {
    setCurrentTable(table);
    setOpenTableOrderModal(true);
  };

  const handlePayment = async (sessionId: string) => {
    try {
      const order = await createOrder(
        {
          sessionId,
          tableId: currentTable?.id || '',
          tableName: currentTable?.name || '',
          zoneName: currentTable?.zone.name || ''
        },
        true
      );
      setOpenTableOrderModal(false);
      if (order?.id) {
        if (currentUser?.currentUserStore?.store?.company?.posIntegration)
          window.ReactNativeWebView?.postMessage(
            JSON.stringify({
              type: 'NAVIGATE_TO_ORDER_DETAILS',
              payload: {
                order
              }
            })
          );
        else navigate(`/order/${order.id}`);
      } else fetchTables();
    } catch (error) {}
  };

  const filteredTables = useMemo(() => {
    const searchValue = filters.search?.trim().toLowerCase() ?? ''; // Đảm bảo không undefined
    return tables
      .filter((table) => table.name.toLowerCase().includes(searchValue))
      .map((table) => ({
        label: `${table.name} - Khu vực ${table.zoneId ?? 'Không xác định'}`, // Hiển thị zoneId
        value: table.id,
        zoneId: table.zoneId // Lưu zoneId để lọc khu vực
      }));
  }, [filters.search, tables]);

  const filteredZoneOptions = useMemo(() => {
    // Nếu không có tìm kiếm, hiển thị tất cả khu vực
    if (filters.search === '') {
      return zoneOptions;
    }
    const uniqueZones = new Set(
      filteredTables
        .map((table) => String(table.zoneId)) // Chuyển về string để so sánh
        .filter((zoneId) => zoneId) // Loại bỏ null/undefined
    );
    return zoneOptions.filter((zone) => uniqueZones.has(String(zone.value))); // Lọc khu vực phù hợp
  }, [filteredTables, zoneOptions, filters.search]);

  const getFilterFields = (): FilterConfig[] => {
    const baseFields: FilterConfig[] = [
      {
        key: 'zoneId',
        label: 'Khu vực',
        type: 'select',
        options: filteredZoneOptions,
        placeholder: 'Chọn khu vực'
      },
      {
        key: 'status',
        label: 'Trạng thái',
        type: 'select',
        options: tableStatus,
        placeholder: 'Trạng thái'
      },
      ...(currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
      currentUser?.currentUserStore?.role === RoleType.MANAGER
        ? [
            {
              key: 'userIds',
              label: 'Nhân viên tiếp nhận',
              type: 'select',
              options: employees.map((item) => ({ value: item.id, label: item.name })),
              placeholder: 'Nhân viên tiếp nhận',
              mode: 'multiple'
            }
          ]
        : [])
    ];
    // Thêm trường search cho mobile
    if (isMaxLgScreen) {
      return [
        {
          key: 'search',
          label: 'Tìm kiếm',
          type: 'search',
          placeholder: 'Tìm kiếm'
        },
        ...baseFields
      ];
    }

    return baseFields;
  };
  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-2 mr-3 items-center'>
          <h2 className='hidden sm:block text-[16px] md:text-xl xl:text-2xl sm:w-auto'>Quản lý bàn</h2>
          {isMaxLgScreen && (
            <>
              <BaseSelect
                className='max-w-36 w-full !text-white [&_.ant-select-arrow]:!text-white [&_.ant-select-selection-item]:!text-white [&_.ant-select-selector]:!bg-[var(--primary)] [&_.ant-select-selector]:!rounded-[20px]'
                value={filters.status ?? ''}
                onChange={(value) => handleStatusFilter((value as TableStatus) || null)}
                options={[
                  { value: '', label: 'Tất cả' },
                  { value: 'OCCUPIED', label: 'Đang sử dụng' },
                  { value: 'EMPTY', label: 'Bàn trống' }
                ]}
              />
              <FilterDropdown
                placement='bottom'
                arrow={{ pointAtCenter: true }}
                filtersFields={getFilterFields()}
                filters={filters}
                setFilters={setFilters}
              />
            </>
          )}
        </div>
      }
    >
      {!openBar && isMaxLgScreen ? (
        <div className='w-full relative flex flex-wrap items-center justify-between gap-4 mb-1'>
          {selectedRowKeys.length === 0 && (
            <>
              {/* Nhóm trái */}
              <div className='flex items-center gap-x-2'>
                {hasPermission && (
                  <p
                    className='flex items-center text-[14px] justify-center gap-1 text-primary font-medium text-[12px] cursor-pointer'
                    onClick={() => setOpenBar(true)}
                  >
                    <BiSelectMultiple size={24} /> <span>Chọn</span>
                  </p>
                )}
                <BaseButton
                  className='text-2xl p-1'
                  variant={switchView ? 'outlined' : 'solid'}
                  onClick={() => setSwitchView(false)}
                >
                  <IoGridOutline />
                </BaseButton>
                <BaseButton
                  className='text-2xl p-1'
                  variant={!switchView ? 'outlined' : 'solid'}
                  onClick={() => setSwitchView(true)}
                >
                  <LuLayoutList />
                </BaseButton>
              </div>

              {/* Nhóm phải */}
              {hasPermission && (
                <div className='flex items-center gap-2'>
                  <BaseButton
                    className='px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm'
                    onClick={() => {
                      setCurrentTable(null);
                      setOpenManageTable(true);
                    }}
                  >
                    Thêm bàn
                  </BaseButton>
                  <BaseButton
                    className='px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm'
                    onClick={() => setOpenManageZone(true)}
                  >
                    Khu vực
                  </BaseButton>
                </div>
              )}
            </>
          )}
        </div>
      ) : null}

      {(selectedRowKeys?.length > 0 || (openBar && isMaxLgScreen)) && (
        <div className='sticky top-0 z-10'>
          <SelectedStatusBar
            selectedCount={selectedRowKeys.length}
            label='bàn'
            onCancel={() => {
              setSelectedRowKeys([]);
              setOpenBar(false);
            }}
            onDelete={() => setOpenDeleteModal(true)}
            sticky
            onSelectAll={(value) => setSelectedRowKeys(value ? filterTables.map((table) => table.id) : [])}
            isAllSelected={selectedRowKeys.length === filterTables.length}
          >
            <BaseButton shape='round' override={theme.success} onClick={handlePrint} icon={<PrinterOutlined />}>
              In QR bàn và QR thanh toán
            </BaseButton>
            <BaseButton
              shape='round'
              override={theme.sunsetEmber}
              onClick={() => handlePrintMultiTable()}
              icon={<PrinterOutlined />}
            >
              In QR bàn
            </BaseButton>
            <BaseButton
              shape='round'
              override={theme.info}
              onClick={() => handleExportTableToPrint()}
              icon={<BsFileEarmarkArrowDown />}
            >
              Xuất dữ liệu
            </BaseButton>
          </SelectedStatusBar>

          {isMaxLgScreen && selectedRowKeys?.length > 0 && (
            <div className='flex flex-col flex-1 mt-0.5 gap-2 overflow-hidden z-10 shadow-md rounded-md '>
              <div className='w-full bg-main flex gap-1 sm:gap-2 justify-around items-center p-1 custom-scrollbar overflow-x-auto'>
                <BaseButton
                  shape='round'
                  className='!bg-transparent !text-primary active:!bg-primary-50'
                  onClick={() => handlePrintMultiTable()}
                  icon={<PrinterOutlined style={{ fontSize: '20px' }} />}
                  type='text'
                >
                  In QR bàn
                </BaseButton>
                <span className='w-px h-4 bg-gray-300 mx-2' />
                <BaseButton
                  shape='round'
                  className='!bg-transparent active:!bg-primary-50'
                  onClick={() => handleExportTableToPrint()}
                  icon={<BsFileEarmarkArrowDown style={{ fontSize: '20px' }} />}
                  style={{
                    color: 'green'
                  }}
                  variant='text'
                >
                  Xuất dữ liệu
                </BaseButton>
              </div>
            </div>
          )}
          {isMaxLgScreen && selectedRowKeys?.length > 0 && (
            <div className='flex flex-col flex-1 mt-0.5 gap-2 overflow-hidden z-10 shadow-md rounded-md '>
              <div className='w-full bg-main flex gap-1 sm:gap-2 justify-around items-center p-1 custom-scrollbar overflow-x-auto'>
                <BaseButton
                  onClick={() => handlePrint()}
                  icon={<PrinterOutlined style={{ fontSize: '20px' }} />}
                  variant='text'
                  className='active:!bg-transparent'
                  style={{
                    color: 'orange'
                  }}
                >
                  In QR bàn và QR thanh toán
                </BaseButton>
              </div>
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col justify-between mt-4 mb-6 flex-wrap gap-3'>
        {/* <div className='flex items-center gap-x-2'>
          <BaseButton
            variant='filled'
            className='px-1 py-0.5 md:px-3 md:py-1 rounded-lg flex items-center gap-x-2 pointer-events-none'
          >
            <div className='bg-primary w-2 h-2 rounded-full'></div>
            <div>Đang sử dụng</div>
          </BaseButton>
          <div className='bg-[#F3F4F6] text-[#4B5563] px-1 py-0.5 md:px-3 md:py-1 rounded-lg flex items-center gap-x-2'>
            <div className='bg-[#4B5563] w-2 h-2 rounded-full'></div>
            <div>Bàn trống</div>
          </div>
        </div> */}
        {/* cái này hiện trên pc */}
        {!isMaxLgScreen && (
          <>
            <div className='flex justify-between'>
              {selectedRowKeys.length === 0 && (
                <div className='flex items-center gap-2 flex-1'>
                  <SearchInput
                    defaultValue={filters.search}
                    onSearch={(value) => handleFiltersChange({ search: value })}
                    placeholder='Tìm kiếm bàn...'
                    className='max-w-96 flex-1'
                  />
                  <FilterDropdown
                    placement='bottom'
                    arrow={{ pointAtCenter: true }}
                    filtersFields={getFilterFields()}
                    filters={filters}
                    setFilters={setFilters}
                    className='w-full'
                  />
                </div>
              )}

              {hasPermission && selectedRowKeys.length === 0 && (
                <div className='flex items-center gap-2'>
                  <BaseButton
                    className='px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm'
                    onClick={() => {
                      setCurrentTable(null);
                      setOpenManageTable(true);
                    }}
                  >
                    Thêm bàn
                  </BaseButton>
                  <BaseButton
                    className='px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm'
                    onClick={() => setOpenManageZone(true)}
                  >
                    Khu vực
                  </BaseButton>
                </div>
              )}
            </div>
            <div className='flex justify-between'>
              <div className='flex items-center gap-x-4'>
                {hasPermission && (
                  <BaseCheckbox
                    checked={selectedRowKeys.length === filterTables.length && filterTables.length > 0}
                    onChange={(e) => {
                      setSelectedRowKeys(e.target.checked ? filterTables.map((table) => table.id) : []);
                    }}
                    className='medium-checkbox'
                  >
                    Chọn tất cả
                  </BaseCheckbox>
                )}
                {/* Nút Đang sử dụng */}
                <BaseButton
                  className={`flex items-center gap-x-2 px-3 py-1 rounded-lg transition !text-black
              ${
                filters.status === TableStatus.OCCUPIED
                  ? '!bg-primary-50 ' // Được chọn -> Nền xanh nhạt, chữ xanh đậm
                  : '!bg-transparent' // Mặc định chưa chọn -> Chữ xanh đậm
              }
            `}
                  color='default'
                  onClick={() => handleStatusFilter(TableStatus.OCCUPIED)}
                >
                  <div className='w-2 h-2 rounded-full bg-primary-600'></div>
                  <span>Đang sử dụng</span>
                </BaseButton>

                {/* Nút Bàn trống */}
                <BaseButton
                  className={`flex items-center gap-x-2 px-3 py-1 rounded-lg transition !text-black
              ${
                filters.status === TableStatus.EMPTY
                  ? '!bg-gray-200' // Được chọn -> Nền xám nhạt, chữ đen
                  : ' !bg-transparent' // Mặc định chưa chọn -> Chữ đen
              }
            `}
                  color='default'
                  onClick={() => handleStatusFilter(TableStatus.EMPTY)}
                >
                  <div className='w-2 h-2 rounded-full bg-gray-400'></div>
                  <span>Bàn trống</span>
                </BaseButton>
              </div>
              <div className='flex items-center gap-x-2'>
                <BaseButton
                  className='text-2xl p-1'
                  variant={switchView ? 'outlined' : 'solid'}
                  onClick={() => setSwitchView(false)}
                >
                  <IoGridOutline />
                </BaseButton>
                <BaseButton
                  className='text-2xl p-1'
                  variant={!switchView ? 'outlined' : 'solid'}
                  onClick={() => setSwitchView(true)}
                >
                  <LuLayoutList />
                </BaseButton>
              </div>
            </div>
          </>
        )}
      </div>

      {filterTables?.length === 0 ? (
        <NoData />
      ) : switchView ? (
        isMaxLgScreen ? (
          <div className='grid grid-cols-1 sm:md:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-1'>
            {filterTables.map((table) => (
              <TableCardRow
                key={table.id}
                table={table}
                checked={selectedRowKeys.includes(table.id)}
                hasPermission={
                  currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
                  currentUser?.currentUserStore?.role === RoleType.MANAGER
                }
                onChange={(e) => handleSelectCheckboxTable(table.id, e.target.checked)}
                onClick={() => {
                  setOpenManageTable(true);
                  setCurrentTable(table);
                }}
                onClickPrint={() => {
                  setCurrentTable(table);
                  setOpenPrintModal(true);
                }}
                onClickComplete={handleClickComplete}
                showCheckbox={openBar || selectedRowKeys.length > 0}
              />
            ))}
          </div>
        ) : (
          <DataTable<Table>
            rowKey='id'
            columns={columns}
            loading={isTableLoading}
            data={filterTables}
            totalItems={filterTables?.length || 0}
            showPagination={false}
            pageSize={total}
            currentPage={1}
            onPageChange={() => {}}
            rowSelectionEnabled={
              currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
              currentUser?.currentUserStore?.role === RoleType.MANAGER
            }
            rowSelectionType='checkbox'
            selectedRowKeys={selectedRowKeys}
            onSelectedRowsChange={(newSelectedRowKeys) => {
              handleRowSelectionChange(newSelectedRowKeys);
            }}
          />
        )
      ) : (
        <div>
          <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6 z-5'>
            {filterTables.map((table) => (
              <TableCard
                key={table.id}
                hasPermission={
                  currentUser?.currentUserStore?.role === RoleType.STORE_OWNER ||
                  currentUser?.currentUserStore?.role === RoleType.MANAGER
                }
                table={table}
                onClick={() => {
                  setOpenManageTable(true);
                  setCurrentTable(table);
                }}
                checked={selectedRowKeys.includes(table.id)}
                onChange={(e) => handleSelectCheckboxTable(table.id, e.target.checked)}
                onClickPrint={() => {
                  setCurrentTable(table);
                  setOpenPrintModal(true);
                }}
                onClickComplete={handleClickComplete}
                showCheckbox={openBar || selectedRowKeys.length > 0 || !isMaxLgScreen}
              />
            ))}
          </div>
        </div>
      )}
      <ManageZone
        open={openManageZone}
        onCloseDrawer={() => setOpenManageZone(false)}
        handleDeleteSuccess={handleDeleteSuccess}
      />
      <ManageTable
        id={currentTable?.id}
        isOpen={openManageTable}
        onClose={() => setOpenManageTable(false)}
        listZones={zones}
        listEmployee={employees}
        resetFilter={() => {
          setFilters(defaultFilters);
        }}
      />
      <ModalDelete
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDeleteTables}
        loading={isTableLoading}
      >
        <h2>Bạn muốn xoá bàn này?</h2>
      </ModalDelete>
      <TableQrCode
        isOpen={openPrintModal}
        onClose={() => setOpenPrintModal(false)}
        table={currentTable}
        handlePrint={handlePrintSingleTable}
        handlePrintPayment={(id) => handleGetTableDataToPrint([id])}
        isBpacExtensionInstalled={bpac.IsExtensionInstalled()}
        handlePrintBpac={handlePrintBpac}
      />
      <ModalTableOrder
        id={currentTable?.id}
        isOpen={openTableOrderModal}
        onClose={() => setOpenTableOrderModal(false)}
        onConfirm={handlePayment}
        loading={isOrderLoading}
      />
      <div className='hidden'>
        <div ref={singleTableRef} className='w-full'>
          {currentTable && <TableQrCodeToPrint table={currentTable} />}
        </div>
        <div ref={multiTableRef} className='w-full'>
          <div className='flex flex-col gap-4 w-full'>
            {selectedRowKeys.length > 0 &&
              selectedRowKeys.map((tableId, index) => (
                <div key={tableId} className={`${index % 2 === 1 ? 'page-break-after' : ''} h-[160px] print-content`}>
                  <TableQrCodeToPrint table={tablesMap[tableId as string]} />
                </div>
              ))}
          </div>
        </div>
        <div ref={multiTablePaymentRef} className='w-full'>
          <div className='qr-container'>
            {dataToPrint.length > 0 &&
              dataToPrint.map((tableToPrint, index) => (
                <div key={`table-${index}`} className='print-content h-[36mm]'>
                  <TableQrCodePaymentToPrint tableToPrint={tableToPrint} />
                </div>
              ))}
          </div>
        </div>
      </div>
      <Modal
        open={isOpenPrintQrAndPaymentQRModal}
        onCancel={() => setIsOpenPrintQrAndPaymentQRModal(false)}
        footer={
          <div className='flex gap-4 w-100'>
            <BaseButton
              key='confirm'
              className={`text-lg font-semibold py-5 w-1/2`}
              variant='filled'
              onClick={() => handleGetTableDataToPrint()}
            >
              In QR
            </BaseButton>
            <BaseButton
              key='confirm'
              className={`text-lg font-semibold py-5 w-1/2`}
              variant='filled'
              onClick={() => handlePrintBpac()}
            >
              <img src={bpacLogo} alt='' className='w-8' />
              In bằng b-PAC
            </BaseButton>
          </div>
        }
        centered={!!isMaxLgScreen}
        title={
          <div className='flex flex-col items-center justify-center gap-2 pt-2 pb-1'>
            {/* <div className={`flex p-3 rounded-full text-2xl`} style={{ backgroundColor: '#ffffff', color: '#15803D' }}>
              <div className='bg-mintMist p-2 rounded-[50%]'>
                <div className='bg-lightGreen p-2 rounded-[50%]'>
                  <FaCheck />
                </div>
              </div>
            </div> */}
            <span className='text-lg text-center'>Vui lòng chọn hình thức in mã Qr bàn và Qr thanh toán</span>
          </div>
        }
      ></Modal>
    </MainHeader>
  );
};

export default TableList;
