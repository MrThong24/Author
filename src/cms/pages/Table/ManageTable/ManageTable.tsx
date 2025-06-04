import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import BaseButton from 'src/shared/components/Buttons/Button';
import TableForm from './TableForm';
import { TablePayload, tableSchema } from 'src/validate/tableSchema';
import useTableStore from 'src/store/useTableStore';
import { Zone } from 'src/types/table.type';
import { Modal } from 'antd';
import TableDetails from './TableDetails';
import { Employee } from 'src/types/employee.type';

interface ManageTableProps {
  id: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  listZones: Zone[];
  listEmployee: Employee[];
  resetFilter: () => void;
}

export default function ManageTable({ id, isOpen, onClose, listZones, listEmployee, resetFilter }: ManageTableProps) {
  const { isLoading, createTable, getTableDetails, tableDetails, updateTable } = useTableStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const defaultValue = {
    name: '',
    zoneId: '',
    userIds: []
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<TablePayload>({
    defaultValues: defaultValue,
    resolver: yupResolver(tableSchema)
  });

  const onSubmit = async (data: TablePayload) => {
    try {
      if (id) {
        await updateTable(id, data);
      } else {
        await createTable(data);
      }
      resetFilter();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id && isOpen) {
      getTableDetails(id);
    }
  }, [id, isOpen]);

  useEffect(() => {
    if (tableDetails && id && isOpen) {
      reset({
        name: tableDetails?.name,
        zoneId: tableDetails?.zoneId,
        userIds: tableDetails?.tableUsers?.map((tableUser) => tableUser.userId)
      });
    }
  }, [tableDetails, id, isOpen]);

  useEffect(() => {
    if (isOpen) {
      reset(defaultValue);
      if (!id) {
        setValue('zoneId', listZones?.[0]?.id);
      }
    }
  }, [isOpen]);

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {(!id || (!!id && isEditing)) && (
          <TableForm
            control={control}
            errors={errors}
            loading={isLoading}
            listZones={listZones}
            listEmployee={listEmployee}
          />
        )}
        {!!id && !isEditing && <TableDetails tableDetails={tableDetails} />}
        <div className='flex justify-end'>
          <div className='flex gap-2'>
            {!id && (
              <BaseButton htmlType='submit' loading={isLoading}>
                Tạo mới
              </BaseButton>
            )}
            {id && isEditing && (
              <BaseButton
                variant='outlined'
                onClick={() => {
                  reset();
                  setIsEditing(false);
                }}
              >
                Hủy bỏ
              </BaseButton>
            )}
            {!!id && !isEditing && <BaseButton onClick={() => setIsEditing(true)}>Chỉnh sửa</BaseButton>}
            {!!id && isEditing && (
              <BaseButton htmlType='submit' loading={isLoading}>
                Cập nhật
              </BaseButton>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
