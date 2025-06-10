import { Table } from "antd";
import React, { useState, useEffect } from "react";
import BaseSelect from "src/shared/components/Core/Select";
import CustomModal from "src/shared/components/Modals/Modal";

// Define types for the dataSource and options
interface DatabaseOption {
  label: string;
  value: string;
}

interface StoreData {
  key: string; // Unique row identifier
  store: string;
  databaseOptions: DatabaseOption[];
  selectedDatabase?: string; // Store the selected database value
}

interface ChooseDatabaseProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dataSource: StoreData[]) => void;
  dataSource: StoreData[]; // Accept dataSource as a prop
}

export default function ChooseDatabase({
  isOpen,
  onClose,
  onConfirm,
  dataSource: initialDataSource,
}: ChooseDatabaseProps) {
  const [dataSource, setDataSource] = useState<StoreData[]>(initialDataSource);

  useEffect(() => {
    setDataSource(initialDataSource);
  }, [initialDataSource]);

  const columns = [
    {
      title: "STT",
      width: "10%",
      render: (_: unknown, __: StoreData, index: number) => index + 1,
    },
    { width: "45%", title: "Phân hệ", dataIndex: "store", key: "store" },
    {
      width: "45%",
      title: "Cơ sở dữ liệu",
      key: "database",
      render: (_: unknown, record: StoreData) => (
        <BaseSelect
          value={record.selectedDatabase}
          options={record.databaseOptions.map((item) => ({
            name: item.label,
            id: item.value,
          }))}
          placeholder="Chọn cơ sở dữ liệu"
          fieldNames={{
            label: "name",
            value: "id",
          }}
          optionFilterProp="name"
          showSearch
          onChange={(value: string | undefined) => {
            // Update local dataSource with the selected value for this row
            setDataSource((prev) =>
              prev.map((item) =>
                item.key === record.key
                  ? { ...item, selectedDatabase: value }
                  : item
              )
            );
          }}
          className="w-full mb-6 text-start"
          key={`select-${record.key}`} // Ensure unique key for each BaseSelect
        />
      ),
    },
  ];

  // Handle confirm action
  const handleConfirm = () => {
    onConfirm(dataSource); // Pass the updated local dataSource to the parent
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      textColorIcon="#EA580C"
      loading={false}
      width={650}
    >
      <Table
        scroll={{ x: "max-content", y: 400 }}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
      />
    </CustomModal>
  );
}
