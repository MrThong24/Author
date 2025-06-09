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
import useCategoryStore from "src/store/useCategoryStore";
import { FilterEmployee } from "src/store/useEmployeeStore";
import { Employee } from "src/types/employee.type";
import { EditOutlined } from "@ant-design/icons";

export default function Category() {
  const { getQuery } = useUrlQuery();
  const navigate = useNavigate();
  const { fetchCategory, isLoading, total, category } = useCategoryStore();
  const [filters, setFilters] = useState<FilterEmployee>({
    search: getQuery("search") || undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const { tableProps, resetToFirstPage } = useTableConfig<
    Employee,
    FilterEmployee
  >({
    data: category,
    totalItems: total,
    isLoading,
    fetchData: fetchCategory,
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
    { title: "Mã phân hệ", dataIndex: "name" },
    { title: "Tên phân hệ", dataIndex: "username" },
    { title: "Loại", dataIndex: "username" },
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

  const handleFiltersChange = (newFilters: Partial<FilterEmployee>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  return (
    <MainHeader
      title={
        <div className="flex items-center gap-[6.8px]">
          <h2 className="text-[16px] lg:text-xl xl:text-2xl">
            Quản lý danh mục/ tính năng
          </h2>
          <div className="flex items-center gap-[6.8px] lg:hidden">
            <FilterDropdown
              filtersFields={[
                {
                  key: "search",
                  label: "Tìm kiếm",
                  type: "search",
                  placeholder: "Nhập tên, mã phân hệ",
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
              placeholder="Nhập tên, mã phân hệ"
              className="max-w-96 flex-1"
            />
          </div>
        </div>
      </div>
      <DataTable<any>
        rowKey="id"
        className="hidden lg:block"
        columns={columns}
        {...tableProps}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <NoData /> }}
      />
    </MainHeader>
  );
}
