import { Empty, Image, Spin, TableColumnsType } from 'antd';
import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import SearchInput from 'src/cms/components/Search/SearchInput';
import DataTable from 'src/cms/components/Table/DataTable';
import { useTableConfig } from 'src/hooks/useTable';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import BaseButton from 'src/shared/components/Buttons/Button';
import { FilterStores } from 'src/store/useStoreStore';
import { Store } from 'src/types/store.type';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import useStoreStore from 'src/store/useStoreStore';
import { imageStoreDefault } from 'src/assets/images';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import useWindowDimensions from 'src/hooks/useWindowDimensions';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';

export default function ManageStores() {
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { fetchStores, stores, isLoading, total, deleteStores } = useStoreStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [rowSelectVisible, setRowSelectVisible] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [filters, setFilters] = useState<FilterStores>({
    search: getQuery('search') || ''
  });

  const { tableProps, resetToFirstPage } = useTableConfig<Store, FilterStores>({
    data: stores,
    totalItems: total,
    isLoading,
    fetchData: fetchStores,
    filters: filters
  });

  const {
    data: dataMobile,
    loading,
    containerRef,
    sentinelRef,
    removeItems
  } = useInfiniteScroll<Store>(fetchStores, filters);

  const handleDeleteEmployees = async () => {
    try {
      await deleteStores(selectedRowKeys);
      await fetchStores(filters);
      removeItems(selectedRowKeys as []); // Add this line to remove items from the local state
      setOpenModalDelete(false);
      setSelectedRowKeys([]);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  const columns: TableColumnsType<Store> = [
    {
      title: 'Tên cửa hàng',
      render: (value: Store) => (
        <div className='flex items-center overflow-hidden gap-4'>
          <Image
            src={generateImageURL(value?.thumbnail) || imageStoreDefault}
            alt='avatar'
            style={{
              borderRadius: '10%',
              width: '35px',
              height: '35px',
              objectFit: 'cover'
            }}
          />
          <h2 className='w-[200px] line-clamp-2'>{value?.name}</h2>
        </div>
      )
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    {
      fixed: 'right',
      title: 'Tác vụ',
      render: (value: Store) => (
        <div>
          <BaseButton
            variant='filled'
            className={`w-[44px] h-[34px] rounded-md overflow-hidden `}
            onClick={() => {
              navigate(`${value?.id}`);
            }}
          >
            <EditOutlined className='text-primary text-[20px] font-bold' />
          </BaseButton>
        </div>
      )
    }
  ];

  const handleRowSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const handleFiltersChange = (newFilters: Partial<FilterStores>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  useEffect(() => {
    if (!selectedRowKeys.length) {
      setRowSelectVisible(false);
    }
  }, [selectedRowKeys]);

  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='text-[16px] lg:text-xl xl:text-2xl'>Quản lý cửa hàng</h2>
          <div className='flex lg:hidden items-center gap-2'>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm cửa hàng...'
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
      <div className='relative flex flex-wrap items-center justify-between gap-4 mb-6'>
        <div className='flex items-center gap-2 flex-1'>
          <div className='lg:hidden flex items-center' onClick={() => setRowSelectVisible(true)}>
            <RiCheckboxMultipleLine size={20} className='text-primary' />
            <p className='text-sm ml-1 text-primary font-medium'>Chọn</p>
          </div>
          {!isMobile && (
            <div className='hidden lg:flex gap-4 items-center flex-1'>
              <SearchInput
                defaultValue={filters.search}
                onSearch={(value) => handleFiltersChange({ search: value })}
                placeholder='Tìm kiếm cửa hàng...'
                className='max-w-96 flex-1'
              />
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <BaseButton onClick={() => navigate('create')}>Tạo mới</BaseButton>
        </div>
        {(rowSelectVisible || !!selectedRowKeys.length) && (
          <SelectedStatusBar
            selectedCount={selectedRowKeys.length}
            label='cửa hàng'
            onCancel={() => {
              setSelectedRowKeys([]);
              setRowSelectVisible(false);
            }}
            onDelete={() => setOpenModalDelete(true)}
            onSelectAll={(value) => {
              setSelectedRowKeys(value ? dataMobile.map((store) => store.id) : []);
            }}
            isAllSelected={dataMobile.length > 0 && selectedRowKeys.length === dataMobile.length}
          />
        )}
      </div>
      <DataTable<Store>
        rowKey='id'
        columns={columns}
        {...tableProps}
        rowSelectionEnabled
        rowSelectionType='checkbox'
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
          setRowSelectVisible(true);
        }}
        scroll={{ x: 'max-content' }}
        className='hidden lg:block'
        locale={{ emptyText: <NoData /> }}
      />
      <div className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-146px)]' ref={containerRef}>
        {!dataMobile?.length && !loading && <NoData />}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-2'>
          {dataMobile?.map((store: Store) => (
            <div key={store.id} className='flex items-center p-3 border rounded-md'>
              {rowSelectVisible && (
                <BaseCheckbox
                  checked={selectedRowKeys.includes(store.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedRowKeys([...selectedRowKeys, store.id]);
                    } else {
                      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== store.id));
                    }
                  }}
                  className='mr-3 medium-checkbox'
                />
              )}
              <div className='flex-1'>
                <div className='flex gap-2 items-center'>
                  <div className='w-[55px]'>
                    <Image
                      src={generateImageURL(store?.thumbnail) || imageStoreDefault}
                      alt='avatar'
                      style={{
                        borderRadius: '10%',
                        width: '55px',
                        height: '55px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div className='flex flex-col gap-1 flex-1'>
                    <h2 className='font-medium'>{store.name}</h2>
                    <h2 className='text-sm font-light'>{store.phone}</h2>
                    <h2 className='text-sm text-primary '>{store.address}</h2>
                  </div>
                </div>
              </div>
              <BaseButton
                className='w-[34px] h-[34px] rounded-md overflow-hidden flex justify-center items-center'
                variant='filled'
                onClick={(e) => {
                  navigate(`${store.id}`);
                }}
              >
                <EditOutlined className='text-primary text-[16px] font-bold' />
              </BaseButton>
            </div>
          ))}
        </div>
        <Spin spinning={loading} className='flex justify-center items-center' />
        <div ref={sentinelRef} />
      </div>
      <ModalDelete
        isOpen={openModalDelete}
        loading={isLoading}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteEmployees}
      >
        <h2>Bạn muốn xoá cửa hàng này?</h2>
      </ModalDelete>
    </MainHeader>
  );
}
