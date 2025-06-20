import { TableColumnsType } from "antd";
import React from "react";
import DataTable from "src/components/Table/DataTable";
import { useTableConfig } from "src/hooks/useTable";
import BaseButton from "src/shared/components/Buttons/Button";
import { Employee } from "src/types/employee.type";
import { EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NoData from "src/components/NoData/NoData";
import useContractStore, { FilterContract } from "src/store/useContractStore";
import { IoEyeOutline } from "react-icons/io5";

export default function ContractAddendum() {
  const { fetchContract, isLoading, total, contract } = useContractStore();
  const navigate = useNavigate();
  const { tableProps, resetToFirstPage } = useTableConfig<
    Employee,
    FilterContract
  >({
    data: contract,
    totalItems: total,
    isLoading,
    fetchData: fetchContract,
    filters: null,
  });

  const columns: TableColumnsType<Employee> = [
    {
      title: "STT",
      width: 60,
      render: (_text, _record, index) =>
        (tableProps.currentPage - 1) * tableProps.pageSize + index + 1,
    },
    { title: "Mã phụ lục", dataIndex: "name" },
    { title: "Ngày tạo", dataIndex: "name" },
    { title: "Nội dung", dataIndex: "name" },
    { title: "Mã", dataIndex: "name" },
    { title: "Ngày có hiệu lực", dataIndex: "name" },
    { title: "Ngày hết hạn", dataIndex: "name" },
    { title: "Hiệu lực", dataIndex: "name" },
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
  return (
    <div>
      <h1 className="text-lg font-semibold text-primary mb-2">
        Thông tin phục lục hợp đồng
      </h1>
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
