import { TableStatus } from 'src/shared/common/enum';
import { TABLE_ICON } from 'src/shared/common/icon';
import { Table } from 'src/types/table.type';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import { CheckboxChangeEvent } from 'antd';
import BaseButton from 'src/shared/components/Buttons/Button';
import { PrinterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'src/provider/ThemeContext';
import { LuQrCode } from 'react-icons/lu';
import useMediaQuery from 'src/hooks/useMediaQuery';

interface TableCardProps {
  hasPermission: boolean;
  table: Table;
  onClick: (e: React.SyntheticEvent) => void;
  checked: boolean;
  onChange: (e: CheckboxChangeEvent) => void;
  onClickPrint: (e: React.SyntheticEvent) => void;
  onClickComplete: (table: Table) => void;
  showCheckbox?: boolean;
}

const TableCard = ({
  hasPermission,
  table,
  onClick,
  checked,
  onChange,
  onClickPrint,
  onClickComplete,
  showCheckbox = false
}: TableCardProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  return (
    <div className='relative pt-4  px-2 pb-5 bg-white flex flex-col justify-center items-center text-center gap-4 md:gap-8 shadow-sm rounded-md'>
      {/* {hasPermission && (
        <>
        {
          showCheckbox && (
            <BaseCheckbox
            name='table'
            checked={checked}
            onChange={onChange}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-2 left-2 medium-checkbox`}
          />
          )
        }
          <LuQrCode
            className='absolute top-2 right-2 cursor-pointer text-primary text-[26px] p-1 rounded-md bg-primary-50 font-bold'
            onClick={onClickPrint}
          />
        </>
      )}
      <div className='line-clamp-2 min-h-[40px] mt-0.5'>
        <span className='font-semibold'>Khu vực</span> <span>{table.zone.name}</span>
      </div> */}
      <div className='flex items-start justify-between w-full gap-2 relative'>
        {/* Checkbox bên trái */}
        <div className='w-6 flex-shrink-0 mt-1'>
          {hasPermission ? (
            <BaseCheckbox
              name='table'
              checked={checked}
              onChange={onChange}
              onClick={(e) => e.stopPropagation()}
              className={`medium-checkbox ${!showCheckbox ? 'invisible' : ''}`}
            />
          ) : null}
        </div>

        {/* Nội dung chính: Khu vực */}
        <div className='flex-1 min-w-0'>
          <div className='line-clamp-2 min-h-[40px] mt-0.5 break-words'>
            <span className='font-semibold'>Khu vực</span> <span>{table.zone.name}</span>
          </div>
        </div>

        {/* QR Code bên phải */}
        <div className='w-6 flex-shrink-0'>
        {hasPermission && (
          <LuQrCode
            className='cursor-pointer text-primary text-[26px] p-1 rounded-md bg-primary-50 font-bold '
            onClick={(e) => {
              e.stopPropagation();
              onClickPrint && onClickPrint();
            }}
          />
        )}
        </div>
      </div>
      <div className='w-fit relative cursor-pointer shadow-sm rounded-md' onClick={(e) => hasPermission && onClick(e)}>
        <div>{<TABLE_ICON fill={table?.status === TableStatus.EMPTY ? '#F3F4F6' : theme.primary} />}</div>
        <p
          className={`absolute overflow-hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-semibold ${table.status === TableStatus.EMPTY ? 'text-black' : 'text-white'}`}
        >
          <span className='max-w-[120px] w-full line-clamp-2 break-words'>{table.name}</span>
        </p>
      </div>

      <div
        className='text-lightOrange cursor-pointer'
        onClick={() => navigate(`/request/order?zoneId=${table.zoneId}&tableId=${table.id}`)}
      >
        <span className='font-semibold'>
          Yêu cầu chờ xử lý
        </span>
        {': '}
        <span>{table.pendingRequestsCount}</span>
      </div>
      <div className='flex gap-2 flex-col md:flex-row justify-center'>
        <BaseButton disabled={table.status === TableStatus.EMPTY} onClick={() => onClickComplete(table)}>
          Thanh toán
        </BaseButton>
        {/* {table.status === TableStatus.OCCUPIED && (
          <BaseButton
            variant='outlined'
            className='hidden md:block'
            onClick={() => navigate(`/request/order?zoneId=${table.zoneId}&tableId=${table.id}`)}
          >
            Xem yêu cầu
          </BaseButton>
        )} */}
      </div>
    </div>
  );
};

export default TableCard;
