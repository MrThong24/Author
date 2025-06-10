import { TableColumnsType } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterDropdown from "src/components/Filter/FilterDropdown";
import MainHeader from "src/components/Headers/MainHeader";
import NoData from "src/components/NoData/NoData";
import SearchInput from "src/components/Search/SearchInput";
import DataTable from "src/components/Table/DataTable";
import { useTableConfig } from "src/hooks/useTable";
import { useUrlQuery } from "src/hooks/useUrlQuery";
import BaseButton from "src/shared/components/Buttons/Button";
import { Employee } from "src/types/employee.type";
import { EditOutlined } from "@ant-design/icons";
import ModalDelete from "src/components/Modal/ModalDelete";
import SelectedStatusBar from "src/components/SelectedStatusBar";
import { EmployeeStatus } from "src/shared/common/enum";
import useGroupEmployeeStore, {
  FilterGroupEmployee,
} from "src/store/useGroupEmployeeStore";

const GroupEmployee = () => {
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { fetchGroupEmployees, isLoading, total, groupEmployees } =
    useGroupEmployeeStore();
  const [filters, setFilters] = useState<FilterGroupEmployee>({
    search: getQuery("search") || undefined,
    startDate: getQuery("startDate") || undefined,
    endDate: getQuery("endDate") || undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const { tableProps, resetToFirstPage } = useTableConfig<
    Employee,
    FilterGroupEmployee
  >({
    data: groupEmployees,
    totalItems: total,
    isLoading,
    fetchData: fetchGroupEmployees,
    filters,
  });

  const [rowSelectVisible, setRowSelectVisible] = useState<boolean>(false);

  const handleRowSelectionChange = async (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: "STT",
      width: 60,
      render: (_text, _record, index) =>
        (tableProps.currentPage - 1) * tableProps.pageSize + index + 1,
    },
    { title: "Tên nhóm người dùng", dataIndex: "name" },
    { title: "Mã nhóm", dataIndex: "username" },
    { title: "Thuộc khách hàng", dataIndex: "phone" },
    { title: "Ngày tạo", dataIndex: "address" },
    {
      fixed: "right",
      title: "Tác vụ",
      render: (value: Employee) => (
        <div>
          <BaseButton
            className={`w-[44px] h-[34px] rounded-md overflow-hidden`}
            variant="filled"
            onClick={() => {
              navigate(`${value?.id}`);
            }}
          >
            <EditOutlined className="text-primary text-[20px] font-bold" />
          </BaseButton>
        </div>
      ),
    },
  ];

  const handleFiltersChange = (newFilters: Partial<FilterGroupEmployee>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const handleDeleteGroupEmployees = async () => {};

  const listStatus = [
    {
      value: EmployeeStatus.ACTIVE,
      label: "Đang sử dụng",
    },
    {
      value: EmployeeStatus.INACTIVE,
      label: "Ngưng hoạt động",
    },
  ];

  return (
    <MainHeader
      title={
        <div className="flex items-center gap-[6.8px]">
          <h2 className="text-[16px] lg:text-xl xl:text-2xl">
            Quản lý tài nhóm người dùng
          </h2>
          <div className="flex items-center gap-[6.8px] lg:hidden">
            <FilterDropdown
              filtersFields={[
                {
                  key: "search",
                  label: "Tìm kiếm",
                  type: "search",
                  placeholder: "Nhập tên nhóm người dùng",
                },
              ]}
              filters={filters}
              setFilters={setFilters}
              placement="bottomCenter"
            />
          </div>
        </div>
      }
    >
      <div className="relative flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1">
          <div className="hidden lg:flex gap-4 items-center flex-1">
            <SearchInput
              defaultValue={filters.search}
              onSearch={(value) => handleFiltersChange({ search: value })}
              placeholder="Nhập tên nhóm người dùng"
              className="max-w-96 flex-1"
            />
            <FilterDropdown
              filtersFields={[
                {
                  label: "Thời gian",
                  type: "date-range",
                },
              ]}
              filters={filters}
              setFilters={setFilters}
              className="w-full"
            />
          </div>
        </div>
        {(rowSelectVisible || !!selectedRowKeys.length) && (
          <SelectedStatusBar
            selectedCount={selectedRowKeys.length}
            label="nhân viên"
            onCancel={() => {
              setSelectedRowKeys([]);
              setRowSelectVisible(false);
            }}
            onDelete={() => setOpenModalDelete(true)}
          />
        )}
        <div className="flex items-center gap-2">
          <BaseButton className="text-xs" onClick={() => navigate("create")}>
            Thêm mới
          </BaseButton>
        </div>
      </div>
      <DataTable<Employee>
        rowKey="id"
        columns={columns}
        {...tableProps}
        rowSelectionEnabled
        rowSelectionType="checkbox"
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
        }}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <NoData /> }}
      />
      <ModalDelete
        title="XÓA NHÓM NGƯỜI DÙNG"
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteGroupEmployees}
      >
        <h2>Bạn muốn xoá nhóm người dùng này?</h2>
      </ModalDelete>
    </MainHeader>
  );
};

export default GroupEmployee;
