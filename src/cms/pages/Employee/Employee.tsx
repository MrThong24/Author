import React, { useState } from 'react';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { useTableConfig } from 'src/hooks/useTable';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import useEmployeeStore, { FilterEmployee } from 'src/store/useEmployeeStore';
import { Employee } from 'src/types/employee.type';
import { EditOutlined } from '@ant-design/icons';
import DataTable from 'src/cms/components/Table/DataTable';
import { useNavigate } from 'react-router-dom';
import { TableColumnsType } from 'antd/lib';
import { Spin } from 'antd';
import SearchInput from 'src/cms/components/Search/SearchInput';
import BaseButton from 'src/shared/components/Buttons/Button';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { FaRegTrashAlt } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';
import { RoleType } from 'src/shared/common/enum';
import useMediaQuery from 'src/hooks/useMediaQuery';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import MobileEmployeeCard from './components/MobileEmployeeCard';
import { Empty } from 'antd';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import NoData from 'src/cms/components/NoData/NoData';
import { RiCheckboxMultipleLine } from 'react-icons/ri';

const EmployeeList = () => {
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { fetchEmployees, isLoading, total, employees, deleteEmployees, getListPosUser } = useEmployeeStore();
  const [filters, setFilters] = useState<FilterEmployee>({
    search: getQuery('search') || undefined
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const { tableProps, resetToFirstPage } = useTableConfig<Employee, FilterEmployee>({
    data: employees,
    totalItems: total,
    isLoading,
    fetchData: fetchEmployees,
    filters
  });
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const { data, loading, containerRef, sentinelRef, removeItems } = useInfiniteScroll<Employee>(
    fetchEmployees,
    filters
  );
  const [rowSelectVisible, setRowSelectVisible] = useState<boolean>(false);

  const handleRowSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const columns: TableColumnsType<Employee> = [
    { title: 'Tên nhân viên', dataIndex: 'name' },
    { title: 'Tài khoản', dataIndex: 'username' },
    { title: 'Số điện thoại', dataIndex: 'phone' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    {
      fixed: 'right',
      title: 'Tác vụ',
      render: (value: Employee) => (
        <div>
          <BaseButton
            className={`w-[44px] h-[34px] rounded-md overflow-hidden`}
            variant='filled'
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

  const handleFiltersChange = (newFilters: Partial<FilterEmployee>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const handleDeleteEmployees = async () => {
    try {
      await deleteEmployees(selectedRowKeys);
      await fetchEmployees(filters);
      removeItems(selectedRowKeys as []);
      setOpenModalDelete(false);
      setSelectedRowKeys([]);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };
  return (
    <MainHeader
      title={
        <div className='flex items-center gap-[6.8px]'>
          <h2 className='text-[16px] lg:text-xl xl:text-2xl'>Quản lý nhân viên</h2>
          <div className='flex items-center gap-[6.8px] lg:hidden'>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm nhân viên...'
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
      <div className='relative'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
          <div className='lg:hidden flex items-center cursor-pointer' onClick={() => setRowSelectVisible(true)}>
            <RiCheckboxMultipleLine size={20} className='text-primary' />
            <p className='text-sm ml-1 text-primary font-medium'>Chọn</p>
          </div>
          {!isMobile && (
            <div className='hidden lg:flex items-center gap-2 flex-1'>
              <SearchInput
                defaultValue={filters.search}
                onSearch={(value) => handleFiltersChange({ search: value })}
                placeholder='Tìm kiếm nhân viên...'
                className='max-w-96 flex-1'
              />
            </div>
          )}
          <div className='flex items-center gap-2'>
            <BaseButton onClick={() => navigate('create')}>Tạo mới</BaseButton>
          </div>
        </div>
        {(rowSelectVisible || !!selectedRowKeys.length) && (
          <SelectedStatusBar
            selectedCount={selectedRowKeys.length}
            label='nhân viên'
            onCancel={() => {
              setSelectedRowKeys([]);
              setRowSelectVisible(false);
            }}
            onDelete={() => setOpenModalDelete(true)}
            onSelectAll={(value) => {
              setSelectedRowKeys(value ? data.map((employee) => employee.id) : []);
            }}
            isAllSelected={selectedRowKeys.length === data.length}
          />
        )}
        <div className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-140px)]' ref={containerRef}>
          {!data?.length && !loading && <NoData />}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {data.map((employee: Employee) => (
              <MobileEmployeeCard
                key={employee.id}
                employee={employee}
                isSelected={selectedRowKeys.includes(employee.id)}
                onSelect={(checked) => {
                  if (checked) {
                    setSelectedRowKeys([...selectedRowKeys, employee.id]);
                  } else {
                    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== employee.id));
                  }
                }}
                onEdit={() => navigate(`${employee.id}`)}
                selection={rowSelectVisible || selectedRowKeys.length > 0}
              />
            ))}
            <Spin spinning={loading} className='flex justify-center items-center' />
            <div ref={sentinelRef} />
          </div>
        </div>
        <div className='hidden lg:block'>
          <DataTable<Employee>
            rowKey='id'
            columns={columns}
            {...tableProps}
            rowSelectionEnabled
            rowSelectionType='checkbox'
            selectedRowKeys={selectedRowKeys}
            onSelectedRowsChange={(newSelectedRowKeys) => {
              handleRowSelectionChange(newSelectedRowKeys);
            }}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: <NoData /> }}
          />
        </div>
        <ModalDelete
          isOpen={openModalDelete}
          onClose={() => setOpenModalDelete(false)}
          onConfirm={handleDeleteEmployees}
        >
          <h2>Bạn muốn xoá nhân viên này?</h2>
        </ModalDelete>
      </div>
    </MainHeader>
  );
};

export default EmployeeList;
