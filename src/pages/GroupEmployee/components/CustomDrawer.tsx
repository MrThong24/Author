import { Drawer, Table, TableColumnsType } from "antd";
import { TableProps } from "antd/lib";
import { FaChevronLeft } from "react-icons/fa";
import SearchInput from "src/components/Search/SearchInput";
type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

interface DataType {
  key: React.ReactNode;
  name: string;
  age: number;
  address: string;
  children?: DataType[];
}
export default function CustomDrawer({
  onClose,
  open,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: "12%",
    },
    {
      title: "Address",
      dataIndex: "address",
      width: "30%",
      key: "address",
    },
  ];
  const data: DataType[] = [
    {
      key: 1,
      name: "John Brown sr.",
      age: 60,
      address: "New York No. 1 Lake Park",
      children: [
        {
          key: 11,
          name: "John Brown",
          age: 42,
          address: "New York No. 2 Lake Park",
        },
        {
          key: 12,
          name: "John Brown jr.",
          age: 30,
          address: "New York No. 3 Lake Park",
          children: [
            {
              key: 121,
              name: "Jimmy Brown",
              age: 16,
              address: "New York No. 3 Lake Park",
            },
          ],
        },
        {
          key: 13,
          name: "Jim Green sr.",
          age: 72,
          address: "London No. 1 Lake Park",
          children: [
            {
              key: 131,
              name: "Jim Green",
              age: 42,
              address: "London No. 2 Lake Park",
              children: [
                {
                  key: 1311,
                  name: "Jim Green jr.",
                  age: 25,
                  address: "London No. 3 Lake Park",
                },
                {
                  key: 1312,
                  name: "Jimmy Green sr.",
                  age: 18,
                  address: "London No. 4 Lake Park",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 2,
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
    },
    {
      key: 3,
      name: "John Brown sr.",
      age: 60,
      address: "New York No. 1 Lake Park",
      children: [
        {
          key: 11,
          name: "John Brown",
          age: 42,
          address: "New York No. 2 Lake Park",
        },
        {
          key: 12,
          name: "John Brown jr.",
          age: 30,
          address: "New York No. 3 Lake Park",
          children: [
            {
              key: 121,
              name: "Jimmy Brown",
              age: 16,
              address: "New York No. 3 Lake Park",
            },
          ],
        },
        {
          key: 13,
          name: "Jim Green sr.",
          age: 72,
          address: "London No. 1 Lake Park",
          children: [
            {
              key: 131,
              name: "Jim Green",
              age: 42,
              address: "London No. 2 Lake Park",
              children: [
                {
                  key: 1311,
                  name: "Jim Green jr.",
                  age: 25,
                  address: "London No. 3 Lake Park",
                },
                {
                  key: 1312,
                  name: "Jimmy Green sr.",
                  age: 18,
                  address: "London No. 4 Lake Park",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  const rowSelection: TableRowSelection<DataType> = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };
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
        onSearch={(value) => console.log("value", value)}
        placeholder="Nhập tên, mã tính năng"
        className="max-w-full flex-1 mb-6"
      />
      <Table<DataType>
        columns={columns}
        pagination={false}
        rowSelection={{ ...rowSelection }}
        dataSource={data}
      />
    </Drawer>
  );
}
