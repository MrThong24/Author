import React from 'react';
import { Empty, Table } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd/es/table';

type RowKey<T> = string | ((record: T, index?: number) => React.Key);

interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination' | 'rowSelection' | 'rowKey'> {
  rowKey?: RowKey<T>;
  loading?: boolean;
  data: T[];
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange?: (page: number, pageSize: number) => void;
  activeRowId?: string | number; // ID của row đang active
  /** Bật/tắt chọn hàng */
  rowSelectionEnabled?: boolean;
  rowSelectionType?: 'checkbox' | 'radio';
  showPagination?: boolean;
  /**
   * Danh sách key đang được chọn - quản lý từ bên ngoài
   */
  selectedRowKeys?: React.Key[];

  /**
   * Callback khi thay đổi selection
   * (trả về toàn bộ newSelectedRowKeys và newSelectedRows)
   */
  onSelectedRowsChange?: (newSelectedRowKeys: React.Key[], newSelectedRows: T[]) => void;
  emptyText?: string;
}

const DataTable = <T extends object>({
  loading = false,
  data = [],
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  rowKey,
  rowSelectionEnabled = false,
  rowSelectionType = 'radio',
  // Quản lý selection
  selectedRowKeys = [],
  onSelectedRowsChange,
  emptyText = 'Không có dữ liệu',
  activeRowId,
  showPagination = true,
  ...restProps
}: DataTableProps<T>) => {
  // Hàm xử lý chuyển trang
  const handleTableChange = (pagination: TablePaginationConfig) => {
    onPageChange?.(pagination.current ?? 1, pagination.pageSize ?? 10);
  };

  // Cấu hình rowSelection nếu bật
  const rowSelection: TableProps<T>['rowSelection'] | undefined = rowSelectionEnabled
    ? {
        type: rowSelectionType,
        // VÔ CÙNG QUAN TRỌNG: lưu selection qua các trang
        preserveSelectedRowKeys: true,
        selectedRowKeys,
        onChange: (newSelectedRowKeys, newSelectedRows) => {
          onSelectedRowsChange?.(newSelectedRowKeys, newSelectedRows);
        }
      }
    : undefined;
  return (
    <Table<T>
      {...restProps}
      loading={loading}
      dataSource={data}
      size='small'
      rowKey={rowKey}
      rowSelection={rowSelection}
      rowClassName={(record) =>
        (record as { id?: string | number }).id === activeRowId ? 'active-row' : 'cursor-pointer'
      }
      pagination={
        showPagination
          ? {
              total: totalItems,
              pageSize,
              current: currentPage,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
              pageSizeOptions: ['10', '20', '50', '100']
            }
          : false
      }
      locale={{ emptyText: <Empty description={emptyText} /> }}
      onChange={handleTableChange}
    />
  );
};

export default DataTable;
