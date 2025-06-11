import { Table, TableColumnsType } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DetailHeader from "src/components/Headers/DetailHeader";
import BaseButton from "src/shared/components/Buttons/Button";

interface DataType {
  key: React.ReactNode;
  name: string;
  age: string;
  children?: DataType[];
}
const data: DataType[] = [
  {
    key: 1,
    name: "Quản lý đơn hàng",
    age: "MO_INVOICE",
    children: [
      {
        key: 11,
        name: "Xem danh sách đơn hàng",
        age: "MO_INVOICE",
      },
      {
        key: 12,
        name: "Xem chi tiết đơn hàng",
        age: "MO_INVOICE",
        children: [
          {
            key: 121,
            name: "Thanh toán đơn hàng",
            age: "MO_INVOICE",
          },
        ],
      },
    ],
  },
];

export default function ManageAccessPlatform() {
  const navigate = useNavigate();
  const [editAccessPlatform, setEditAccessPlatform] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSubmit = () => {
    console.log("🇻🇳 👉 selectedRowKeys", selectedRowKeys);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "Tên tính năng",
      dataIndex: "name",
      key: "name",
      width: "50%",
    },
    {
      title: "Mã",
      dataIndex: "age",
      key: "age",
      width: "50%",
    },
  ];
  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    checkStrictly: false,
  };
  return (
    <DetailHeader
      title={
        <div className="flex w-full justify-between">
          <h2 className="text-xl font-semibold">{`${
            editAccessPlatform ? "Chỉnh sửa" : "Chi tiết"
          } nhóm người dùng`}</h2>
        </div>
      }
      rightElement={
        <div className="flex items-center gap-2">
          {editAccessPlatform && (
            <BaseButton
              disabled={false}
              onClick={() => {
                setEditAccessPlatform(false);
              }}
              color="danger"
              className="w-[120px]"
            >
              Huỷ
            </BaseButton>
          )}
          <BaseButton
            loading={false}
            onClick={() => {
              if (editAccessPlatform) onSubmit();
              else setEditAccessPlatform(true);
            }}
            className="w-[120px]"
          >
            {editAccessPlatform ? "Lưu thông tin" : "Chỉnh sửa"}
          </BaseButton>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      <div className="flex w-full mt-10 justify-between mb-2">
        <h1 className="text-lg font-semibold text-primary">
          Danh sách tính năng hệ thống Platform
        </h1>
      </div>
      <Table<DataType>
        columns={columns}
        pagination={false}
        defaultExpandAllRows
        rowSelection={editAccessPlatform ? rowSelection : undefined}
        dataSource={data}
        scroll={{ x: "max-content" }}
      />
    </DetailHeader>
  );
}
