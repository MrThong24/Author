import Label from 'src/shared/components/Core/Label';
import { Table } from 'src/types/table.type';

interface TableFormProps {
  tableDetails: Table | null;
}

export default function TableDetails({ tableDetails }: TableFormProps) {
  return (
    <div>
      <div className='mb-4'>
        <Label text='Tên bàn' className='mb-1' validate={true} />
        <span>{tableDetails?.name || ''}</span>
      </div>
      <div className='mb-4'>
        <Label text='Khu vực' className='mb-1' validate={true} />
        <span>{tableDetails?.zone?.name || ''}</span>
      </div>
      <div className='mb-4'>
        <Label text='Nhân viên tiếp nhận' className='mb-1' />
        {tableDetails?.tableUsers?.map((tableUser) => (
          <div>
            <p>
              {tableUser.user.name}
              {' - '}
              <span className='text-xs text-gray-600'>{tableUser.user.username}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
