import { TableColumnsType } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { PiNotePencil } from 'react-icons/pi';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { IoMdNotificationsOutline } from 'react-icons/io';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import { HistoryRequest, RequestProduct } from 'src/types/request.type';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import SearchInput from 'src/cms/components/Search/SearchInput';
import { AiOutlineReload } from 'react-icons/ai';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { useForm } from 'react-hook-form';
import { RequestTransferredPayload, requestTransferredSchema } from 'src/validate/requestTransferredSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from 'src/cms/components/Table/DataTable';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import { MdCheck } from 'react-icons/md';
import { useTableConfig } from 'src/hooks/useTable';
import { RequestStatusBadge } from 'src/cms/components/Badge/RequestStatusBadge';
import { RequestStatus, RoleType } from 'src/shared/common/enum';
import BaseSelect from 'src/shared/components/Core/Select';
import useZoneStore from 'src/store/useZoneStore';
import { Table, Zone } from 'src/types/table.type';
import { tableStatus } from 'src/shared/common/constant';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { CiUser } from 'react-icons/ci';
import { imageCardDefault } from 'src/assets/images';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import NoData from 'src/cms/components/NoData/NoData';
import ChangeQuantityModal from '../components/ChangeQuantityModal';
export default function History() {
  const navigate = useNavigate();
  const { getQuery } = useUrlQuery();
  const { fetchRequestHistory, requestsProductHistory, total, isLoading, updateServeOrRemade } =
    useRequestProductStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const location = useLocation();

  const [filters, setFilters] = useState<FilterKitchen>({
    search: getQuery('search') || '',
    zoneId: getQuery('zoneId') || null,
    tableId: getQuery('tableId') || null,
    status: getQuery('status') || null,
    startDate: getQuery('startDate') || dayjs().startOf('day'),
    endDate: getQuery('endDate') || dayjs().endOf('day'),
    role: location.pathname === '/kitchen/inprogress/history' ? RoleType.CHEF : RoleType.STAFF
  });
  const { fetchZones, zones } = useZoneStore();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [valueRow, setValueRow] = useState<HistoryRequest>();
  const [valueChange, setValueChange] = useState<number>(0);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const { tableProps, resetToFirstPage } = useTableConfig<HistoryRequest, FilterKitchen>({
    data: requestsProductHistory,
    totalItems: total,
    isLoading,
    fetchData: fetchRequestHistory,
    filters
  });
  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const isMobile = useMediaQuery('(max-width: 767px)');

  const columns: TableColumnsType<HistoryRequest> = [
    {
      title: 'Món ăn',
      width: 300,
      render: (value: HistoryRequest) => {
        return (
          <div className='flex flex-col gap-2 lg:items-start '>
            <div className='flex gap-2 flex-wrap text-center items-center'>
              <p className='font-semibold break-words text-[16px] text-left'>{value?.requestProduct?.productName}</p>
              <span className='text-darkGreen text-[12px] font-normal px-2 rounded-[40px] py-[2px] bg-[#F0FDF4]'>
                {capitalizeFirstLetter(dayjs(value.createdAt).fromNow()).replace('tới', 'trước')}
              </span>
            </div>
            {value.requestProduct.note && (
              <div className='flex items-center gap-1'>
                <PiNotePencil className='text-[18px] text-lightGray' />
                <h3 className='font-light text-mediumGray'>{value.requestProduct.note}</h3>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: 'Bàn',
      width: 200,
      render: (value: HistoryRequest) => (
        <div>{`${value?.requestProduct.request?.table?.name} - ${value?.requestProduct.request?.table?.zone?.name}`}</div>
      )
    },
    {
      title: 'Khách hàng',
      width: 150,
      render: (value: HistoryRequest) => <div>{value?.requestProduct.request?.sessionCustomer?.customer?.name}</div>
    },
    {
      title: 'Số lượng',
      align: 'center',
      width: 150,
      render: (value: HistoryRequest) => <div>{value?.quantity}</div>
    },
    {
      title: 'Trạng thái',
      width: 150,
      render: (value: HistoryRequest) => {
        return RequestStatusBadge(value.status);
      }
    },
    {
      title: 'Tác vụ',
      width: 130,
      fixed: 'right',
      render: (value: HistoryRequest) => {
        return (
          <div className='flex gap-4'>
            <BaseButton
              variant='outlined'
              color='danger'
              disabled={[RequestStatus.CANCELED, RequestStatus.REMADE].includes(value.status as RequestStatus)}
              style={{
                borderColor: `${[RequestStatus.CANCELED, RequestStatus.REMADE].includes(value.status as RequestStatus) ? undefined : '#FCBF0F'}`
              }}
              onClick={() => {
                setOpenModal(true);
                setValueRow(value);
                setValueChange(value?.quantity);
              }}
            >
              <AiOutlineReload
                className={`text-[18px] ${![RequestStatus.CANCELED, RequestStatus.REMADE].includes(value.status as RequestStatus) ? 'text-[#F89734]' : undefined} `}
              />
            </BaseButton>
          </div>
        );
      }
    }
  ];

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm<RequestTransferredPayload>({
    resolver: yupResolver(requestTransferredSchema)
  });

  const handleServeOrRemade = async (isServe: boolean) => {
    const reasonValue = getValues('reason'); // Lấy giá trị của reason
    await updateServeOrRemade(
      [
        {
          quantity: valueChange,
          id: valueRow?.requestProduct?.id as string,
          reason: !isServe ? reasonValue : undefined // Chỉ gửi lý do khi làm lại món
        }
      ],
      isServe
    );
    reset();
    await fetchRequestHistory(filters);
    setOpenModal(false);
  };

  const handleFiltersChange = (newFilters: Partial<FilterKitchen>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const listStatus = [
    {
      value: RequestStatus.CANCELED,
      label: 'Đã hủy'
    },
    {
      value: RequestStatus.COMPLETED,
      label: 'Đã hoàn tất'
    },
    {
      value: RequestStatus.SERVED,
      label: 'Đã phục vụ'
    },
    {
      value: RequestStatus.REMADE,
      label: 'Làm lại'
    }
  ];

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

  // Khong phan trang tren mobile
  useEffect(() => {
    const params = filters;
    if (isMobile) {
      params.page = 0;
      fetchRequestHistory(params);
    }
  }, [fetchRequestHistory, isMobile, filters]);
  return (
    <DetailHeader
      title='Lịch sử món'
      rightElement={
        <FilterDropdown
          filtersFields={[
            {
              key: 'search',
              label: 'Tìm kiếm',
              type: 'search',
              placeholder: 'Tìm kiếm...'
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
            },
            {
              key: 'status',
              options: listStatus,
              label: 'Trạng thái',
              type: 'select',
              placeholder: 'Chọn trạng thái'
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
      handleBack={() => navigate(-1)}
    >
      <DataTable<HistoryRequest>
        rowKey='id'
        columns={columns}
        {...tableProps}
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
        }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <NoData /> }}
      />
      <ChangeQuantityModal
        type={'danger'}
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          reset();
        }}
        onConfirm={handleSubmit(() => handleServeOrRemade(false))}
        icon={<IoMdNotificationsOutline className='text-[26px] text-successGreen' />}
        loading={isLoading}
        confirmLabel={'Làm lại'}
        buttonClassName={'!bg-[#F89734]'}
      >
        <div className='w-full'>
          <p className='text-center font-light text-[16px]'>
            Xác nhận yêu cầu làm lại món{' '}
            <span className='text-black font-medium'>{valueRow?.requestProduct?.productName}</span> với số lượng:
          </p>
          <div className='flex justify-center my-3'>
            <QuantityInput
              className='text-[16px]'
              disabled={(valueRow?.quantity || 0) <= valueChange}
              value={valueChange}
              onChange={(value) => setValueChange(value)}
            />
          </div>
          <div className='mt-4'>
            <Label text='Lý do cần làm lại' validate={true} className='font-normal text-mediumGray text-[14px]' />
            <FormInput
              control={control}
              name='reason'
              type='textarea'
              disabled={false}
              placeholder='Nhập nội dung'
              errors={errors}
              size='large'
              className='text-[14px]'
            />
          </div>
        </div>
      </ChangeQuantityModal>
    </DetailHeader>
  );
}
