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
import { FilterContract } from "src/store/useContractStore";
import useCustomerStore from "src/store/useCustomerStore";
import { IoEyeOutline } from "react-icons/io5";

export default function Customer() {
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { fetchCustomer, isLoading, total, customer } = useCustomerStore();
  const [filters, setFilters] = useState<FilterContract>({
    search: getQuery("search") || undefined,
  });
  const [rowSelectVisible, setRowSelectVisible] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const { tableProps, resetToFirstPage } = useTableConfig<
    Employee,
    FilterContract
  >({
    data: customer,
    totalItems: total,
    isLoading,
    fetchData: fetchCustomer,
    filters,
  });

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
    { title: "Tên khách hàng", dataIndex: "name" },
    { title: "Mã ", dataIndex: "name" },
    { title: "Ngày cập nhật gần nhất", dataIndex: "name" },
    { title: "Trạng thái ", dataIndex: "name" },
    {
      fixed: "right",
      title: "Tác vụ",
      render: (value: Employee) => (
        <div>
          <BaseButton
            variant="link"
            onClick={() => {
              navigate(`${value?.id}`);
            }}
          >
            <IoEyeOutline className="text-gray-500 font-semibold" size={24} />
          </BaseButton>
        </div>
      ),
    },
  ];

  const handleFiltersChange = (newFilters: Partial<FilterContract>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };
  const handleDeleteDatabase = () => {};
  return (
    <MainHeader
      title={
        <div className="flex items-center gap-[6.8px]">
          <h2 className="text-[16px] lg:text-xl xl:text-2xl">
            Quản lý khách hàng
          </h2>
          <div className="flex items-center gap-[6.8px] lg:hidden">
            <FilterDropdown
              filtersFields={[
                {
                  key: "search",
                  label: "Tìm kiếm",
                  type: "search",
                  placeholder: "Nhập tên, mã khách hàng",
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
              placeholder="Nhập tên, mã khách hàng"
              className="max-w-96 flex-1"
            />
          </div>
        </div>
        {(rowSelectVisible || !!selectedRowKeys.length) && (
          <SelectedStatusBar
            selectedCount={selectedRowKeys.length}
            label="dịch vụ"
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
        isOpen={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onConfirm={handleDeleteDatabase}
      >
        <h2>Bạn muốn cơ sỡ dữ liệu này?</h2>
      </ModalDelete>
    </MainHeader>
  );
}
