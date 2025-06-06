import { useMemo, useState } from "react";
import { Drawer, Table, TableColumnsType } from "antd";
import { TableProps } from "antd/lib";
import { FaChevronLeft } from "react-icons/fa";
import SearchInput from "src/components/Search/SearchInput";
import BaseButton from "src/shared/components/Buttons/Button";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

interface DataType {
  key: React.ReactNode;
  name: string;
  age: string;
  children?: DataType[];
}

export default function CustomDrawer({
  onClose,
  open,
  onSaveSelection,
}: {
  onClose: () => void;
  open: boolean;
  onSaveSelection: (selectedKeys: React.Key[]) => void;
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    checkStrictly: false,
  };

  const removeVietnameseAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filterData = (data: DataType[], keyword: string): DataType[] => {
    return data
      .map((item) => {
        const nameMatch = removeVietnameseAccents(item.name).includes(
          removeVietnameseAccents(keyword)
        );

        const filteredChildren = item.children
          ? filterData(item.children, keyword)
          : [];

        if (nameMatch || filteredChildren.length > 0) {
          return {
            ...item,
            children:
              filteredChildren.length > 0 ? filteredChildren : undefined,
          };
        }

        return null;
      })
      .filter(Boolean) as DataType[];
  };

  const filteredData = useMemo(() => {
    if (!searchKeyword) return data;
    return filterData(data, searchKeyword);
  }, [searchKeyword]);

  return (
    <Drawer
      title={<p>Danh sách</p>}
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      style={{ padding: 0, height: "100dvh" }}
      width="50%"
      closeIcon={<FaChevronLeft className="text-[20px]" />}
    >
      <SearchInput
        onSearch={(value) => setSearchKeyword(value as string)}
        placeholder="Nhập tên, mã tính năng"
        className="max-w-full flex-1 mb-6"
      />
      <Table<DataType>
        columns={columns}
        pagination={false}
        defaultExpandAllRows
        rowSelection={rowSelection}
        dataSource={filteredData}
      />
      <BaseButton
        onClick={() => {
          onSaveSelection(selectedRowKeys);
          onClose();
        }}
        className="w-[120px]"
      >
        Lưu
      </BaseButton>
    </Drawer>
  );
}
