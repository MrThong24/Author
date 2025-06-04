import React from 'react';
import BaseButton from 'src/shared/components/Buttons/Button';
import { MdOutlineCancel } from 'react-icons/md';
import { FaRegTrashAlt } from 'react-icons/fa';
import useMediaQuery from 'src/hooks/useMediaQuery';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import { IoMdClose } from 'react-icons/io';

interface SelectedStatusBarProps {
  selectedCount: number;
  label?: string;
  onCancel: () => void;
  onDelete: () => void;
  onSelectAll?: (value: boolean) => void;
  isAllSelected?: boolean;
  children?: React.ReactNode;
  sticky?: boolean;
}

const SelectedStatusBar: React.FC<SelectedStatusBarProps> = ({
  selectedCount,
  label = 'mục',
  onCancel,
  onDelete,
  onSelectAll,
  isAllSelected = false,
  children,
  sticky
}) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  return (
    <div
      className={` ${sticky ? 'sticky top-[-24px] p-3' : 'absolute -top-2 p-1 xl:p-4'} w-full max-h-[48px] -bottom-2 left-0 right-0 bg-main flex justify-between items-center z-10 shadow-md rounded-md overflow-hidden overflow-x-auto custom-scrollbar`}
    >
      <div className='flex items-center gap-2'>
        {isMobile && <IoMdClose className='text-lg cursor-pointer mt-0.5' onClick={onCancel} />}
        {onSelectAll && isMobile && (
          <BaseCheckbox
            checked={isAllSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className='medium-checkbox font-medium'
          >
            Chọn tất cả
          </BaseCheckbox>
        )}
        <span className=' text-gray-500 text-sm whitespace-nowrap mr-2'>Đã chọn {selectedCount}</span>
      </div>
      <div className='flex items-center gap-2'>
        {isMobile || (
          <BaseButton shape='round' icon={<MdOutlineCancel />} variant='outlined' onClick={onCancel}>
            Hủy bỏ
          </BaseButton>
        )}
        {isMobile || children}
        {!!selectedCount && (
          <BaseButton
            shape='round'
            icon={<FaRegTrashAlt className={isMobile ? 'text-lg' : ''} />}
            color='danger'
            onClick={onDelete}
            variant={isMobile ? 'text' : 'solid'}
            className={isMobile ? '!px-1' : ''}
          >
            {isMobile || 'Xóa'}
          </BaseButton>
        )}
      </div>
    </div>
  );
};

export default SelectedStatusBar;
