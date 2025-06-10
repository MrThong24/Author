import { TableColumnsType } from "antd";
import React, { useState } from "react";
import NoData from "src/components/NoData/NoData";
import SearchInput from "src/components/Search/SearchInput";
import DataTable from "src/components/Table/DataTable";
import { useTableConfig } from "src/hooks/useTable";
import { useUrlQuery } from "src/hooks/useUrlQuery";
import BaseButton from "src/shared/components/Buttons/Button";
import useCustomerStore, { FilterCustomer } from "src/store/useCustomer";
import { Employee } from "src/types/employee.type";

export default function AdjustmentHistory() {
  const { getQuery } = useUrlQuery();
  const { fetchCustomer, isLoading, total, customer } = useCustomerStore();
  const [filters, setFilters] = useState<FilterCustomer>({
    search: getQuery("search") || undefined,
  });
  const { tableProps, resetToFirstPage } = useTableConfig<
    Employee,
    FilterCustomer
  >({
    data: customer,
    totalItems: total,
    isLoading,
    fetchData: fetchCustomer,
    filters,
  });
  const columns: TableColumnsType<Employee> = [
    {
      title: "STT",
      width: 60,
      render: (_text, _record, index) =>
        (tableProps.currentPage - 1) * tableProps.pageSize + index + 1,
    },
    { title: "Tài khoản thực hiện", dataIndex: "name" },
    { title: "Thời gian thực hiện", dataIndex: "name" },
    { title: "Hạng mục", dataIndex: "name" },
    { title: "Thao tác", dataIndex: "name" },
    { title: "Ghi chú", dataIndex: "name" },
    {
      fixed: "right",
      title: "Tác vụ",
      render: (value: Employee) => <div>Xem thêm</div>,
    },
  ];
  const handleFiltersChange = (newFilters: Partial<FilterCustomer>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };
  return (
    <div>
      <div className="relative flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1">
          <div className="hidden lg:flex gap-4 items-center flex-1">
            <SearchInput
              defaultValue={filters.search}
              onSearch={(value) => handleFiltersChange({ search: value })}
              placeholder="Nhập email, hạng mục"
              className="max-w-96 flex-1"
            />
          </div>
        </div>
      </div>
      <DataTable<Employee>
        rowKey="id"
        columns={columns}
        {...tableProps}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: <NoData /> }}
      />
    </div>
  );
}
