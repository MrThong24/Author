import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Employee } from 'src/types/employee.type';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import BaseButton from 'src/shared/components/Buttons/Button';
import { FaRegUser } from 'react-icons/fa';
import { roleTypes } from 'src/shared/common/constant';
import useAuthStore from 'src/store/authStore';

interface MobileEmployeeCardProps {
  employee: Employee;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  selection: boolean;
}

const MobileEmployeeCard: React.FC<MobileEmployeeCardProps> = ({
  employee,
  isSelected,
  onSelect,
  onEdit,
  selection
}) => {
  const { currentUser } = useAuthStore();
  const storeId = currentUser?.currentUserStore?.storeId;
  return (
    <div
      onClick={onEdit}
      className='relative flex items-center justify-between p-3 shadow-[0px_0px_15px_0px_rgba(0,0,0,0.05)] rounded-md bg-white'
    >
      <div className='flex items-center gap-x-3'>
        {selection && (
          <BaseCheckbox
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              onSelect(e.target.checked);
            }}
            className='medium-checkbox'
          />
        )}

        <div className='flex items-center gap-x-2'>
          <div className='p-[8px] rounded-lg bg-primary-50'>
            <FaRegUser size={20} className='text-primary' />
          </div>
          <div className='flex-1'>
            <div className='font-medium'>
              {employee.name} - <span className='text-gray-500 text-sm'>{employee.username}</span>
            </div>
            <div className='text-gray-500 text-sm'>{employee.phone}</div>
          </div>
        </div>
      </div>
      {/* <p className='text-gray-700'>
        {
          roleTypes.find(
            (role) => role.value === employee?.userStores?.find((userStore) => userStore.store.id === storeId)?.role
          )?.label
        }
      </p> */}
    </div>
  );
};

export default MobileEmployeeCard;
