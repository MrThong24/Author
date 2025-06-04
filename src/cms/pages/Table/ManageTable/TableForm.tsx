import { Control, FieldErrors } from 'react-hook-form';
import FormInput from 'src/shared/components/Form/FormInput';
import Label from 'src/shared/components/Core/Label';
import FormSelect from 'src/shared/components/Form/FormSelect';
import { TablePayload } from 'src/validate/tableSchema';
import { Zone } from 'src/types/table.type';
import { Employee } from 'src/types/employee.type';
import NoData from 'src/cms/components/NoData/NoData';

interface TableFormProps {
  control: Control<TablePayload>;
  errors: FieldErrors<TablePayload>;
  loading: boolean;
  listZones: Zone[];
  listEmployee: Employee[];
}

export default function TableForm({ control, errors, loading, listZones, listEmployee }: TableFormProps) {
  const removeVietnameseAccents = (str: string) => {
    return str
      .normalize('NFD') // Tách dấu khỏi chữ cái gốc
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu
      .toLowerCase(); // Chuyển về chữ thường
  };

  return (
    <div>
      <div className='flex flex-col flex-1 gap-y-2'>
        <Label text='Tên bàn' className='mb-2' validate={true} />
        <FormInput
          disabled={loading}
          control={control}
          name='name'
          placeholder='Nhập tên bàn...'
          errors={errors}
          size='large'
        />
      </div>
      <div className='flex flex-col flex-1 gap-y-2'>
        <Label text='Khu vực' validate={true} />
        <FormSelect
          control={control}
          disabled={loading}
          name='zoneId'
          options={listZones.map((zone) => ({
            value: zone.id,
            label: zone.name
          }))}
          errors={errors}
          size='large'
          placeholder='Chọn khu vực...'
        />
      </div>
      <div className='flex flex-col flex-1 gap-y-2'>
        <Label text='Nhân viên tiếp nhận' />
        <FormSelect
          mode='multiple'
          control={control}
          disabled={loading}
          name='userIds'
          options={listEmployee.map((employer) => ({
            value: employer.id,
            label: employer.name
          }))}
          errors={errors}
          size='large'
          placeholder='Chọn nhân viên...'
          showSearch
          notFoundContent={<NoData />}
          filterOption={(input, option) =>
            typeof option?.label === 'string' &&
            removeVietnameseAccents(option.label).includes(removeVietnameseAccents(input))
          }
        />
      </div>
    </div>
  );
}
