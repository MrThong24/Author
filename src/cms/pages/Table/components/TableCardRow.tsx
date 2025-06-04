import React from 'react';
import { Table } from 'src/types/table.type';
import { TableStatus } from 'src/shared/common/enum';
import BaseButton from 'src/shared/components/Buttons/Button';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import { LuQrCode } from 'react-icons/lu';
import { EditOutlined } from '@ant-design/icons';

interface TableCardRowProps {
  table: Table;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick?: () => void;
  onClickPrint?: () => void;
  onClickComplete?: (table: Table) => void;
  hasPermission?: boolean;
  showCheckbox?: boolean;
}

const TableCardRow: React.FC<TableCardRowProps> = ({
  table,
  checked,
  onChange,
  onClick,
  onClickPrint,
  hasPermission = false,
  showCheckbox = false
}) => {
  const isOccupied = table.status === TableStatus.OCCUPIED;
  const renderStatusTag = () => {
    const renderTag = (text: string, className: string) => (
      <span
        className={`flex items-center justify-center font-medium text-[10px] whitespace-nowrap rounded-full px-2 py-1 ${className}`}
      >
        {text}
      </span>
    );

    if (isOccupied) {
      return renderTag('Đang sử dụng', 'text-primary bg-primary-50');
    }

    if (table.status === TableStatus.EMPTY) {
      return renderTag('Bàn trống', 'text-[#4B5563] bg-[#F3F4F6]');
    }
    return null;
  };

  return (
    <div className='flex w-full bg-white border rounded-lg overflow-hidden shadow-sm mb-2 relative cursor-pointer justify-around'>
      <div className='flex flex-1 justify-between  items-center p-2 gap-3'>
        {/* Checkbox */}
        {showCheckbox && hasPermission && (
          <BaseCheckbox
            checked={checked}
            onChange={(e) => {
              e.stopPropagation();
              onChange && onChange?.(e);
            }}
            className='flex-shrink-0'
          />
        )}
        {/* Table info */}
        <div className={`flex flex-grow min-w-0 items-center gap-3 ${!hasPermission? 'justify-between':''}`}>
          <div className='flex flex-col overflow-hidden max-w-[200px] w-full flex-grow'>
            {table?.pendingRequestsCount !== undefined && (
              <div className='text-red-500 text-[11px] font-medium'>Yêu cầu: {table.pendingRequestsCount}</div>
            )}
            <div className='font-medium text-[14px] line-clamp-3 break-words'>
              {table.name} - {table.zone?.name || 'Chưa phân khu vực'}
            </div>
          </div>
          {/* Status */}
          <div className='items-center flex-shrink-0  w-[80px]'>{renderStatusTag()}</div>
        </div>
        {hasPermission && (
          <div className='flex items-center gap-2 justify-between'>
            {/* Edit button */}
            <BaseButton
              className='group w-8 h-8 flex-shrink-0 p-0 bg-primary-50'
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              <EditOutlined className='text-primary text-[20px] group-hover:text-white group-active:text-white font-bold' />
            </BaseButton>
            {/* QR Code button */}
            <BaseButton
              className='group w-8 h-8 flex-shrink-0 p-0 bg-primary-50'
              onClick={(e) => {
                e.stopPropagation();
                onClickPrint?.();
              }}
            >
              <LuQrCode className='text-primary text-[20px] group-hover:text-white group-active:text-white font-bold' />
            </BaseButton>
            {/* Payment button */}
            {/* <BaseButton
              disabled={table.status === TableStatus.EMPTY}
              onClick={(e) => {
                e.stopPropagation();
                onClickComplete && onClickComplete(table);
              }}
            >
              Thanh toán
            </BaseButton> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableCardRow;
