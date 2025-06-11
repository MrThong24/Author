import { useEffect, useMemo, useState } from "react";
import { Drawer, Table, TableColumnsType } from "antd";
import { TableProps } from "antd/lib";
import { FaChevronLeft } from "react-icons/fa";
import SearchInput from "src/components/Search/SearchInput";
import BaseButton from "src/shared/components/Buttons/Button";
import { removeVietnameseAccents } from "src/shared/common/format";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

interface DataType {
  key: React.ReactNode;
  name: string;
  age: string;
  children?: DataType[];
}

interface Props {
  onClose: () => void;
  open: boolean;
  onSaveSelection: (selectedKeys: React.Key[]) => void;
  dataDrawer: DataType[];
  initialSelectedKeys?: React.Key[];
}

export default function CustomDrawer({
  onClose,
  open,
  onSaveSelection,
  dataDrawer,
  initialSelectedKeys = [],
}: Props) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>();

  useEffect(() => {
    setSelectedRowKeys(initialSelectedKeys);
  }, [initialSelectedKeys]);

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
    if (!searchKeyword) return dataDrawer;
    return filterData(dataDrawer, searchKeyword);
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
          onSaveSelection(selectedRowKeys || []);
          onClose();
        }}
        className="w-[120px]"
      >
        Lưu
      </BaseButton>
    </Drawer>
  );
}
