import { Dropdown, Tag, Tooltip } from 'antd';
import { MenuProps } from 'antd/lib';
import { useMemo, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FiXCircle } from 'react-icons/fi';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { AiOutlineReload } from 'react-icons/ai';
import { useTheme } from 'src/provider/ThemeContext';
import { PiNotePencil } from 'react-icons/pi';
import { HistoryRequest } from 'src/types/request.type';
import { imageCardDefault } from 'src/assets/images';
import BaseButton from 'src/shared/components/Buttons/Button';
import { BiDish } from 'react-icons/bi';

interface ICardRequestProductProps {
  customerName?: string;
  productName: string;
  note?: string | null;
  reason?: HistoryRequest[];
  table?: string;
  quantityNeed: number;
  quantityAvailble: number;
  title: string;
  onConfirm: any;
  onCancel: any;
  time?: string;
  type?: string;
  permission: boolean;
  thumbnail?: string;
}
export default function CardRequestProductNew({
  productName,
  note,
  reason,
  table,
  quantityNeed,
  quantityAvailble,
  title,
  onConfirm,
  onCancel,
  time,
  type,
  permission,
  thumbnail,
  customerName
}: ICardRequestProductProps) {
  const { theme } = useTheme();

  return (
    <div className='bg-white rounded-xl shadow-lg p-4 mx-auto font-sans w-full h-full border-b-4 border-primary flex flex-col'>
      {/* Header */}
      <div className='flex justify-between items-center pb-3 space-x-2'>
        <div className='flex items-center space-x-2 overflow-hidden max-w-[75%]'>
          <BiDish className=' min-w-[30px] text-primary' size={30} />
          <div className='overflow-hidden flex-1'>
            <Tooltip title={customerName} placement='top' color={theme?.primary}>
              <h3 className='font-semibold text-md line-clamp-1 break-words'>{customerName}</h3>
            </Tooltip>
            <p className='text-sm text-gray-700 font-medium line-clamp-2 break-words h-[40px]'>{table}</p>
          </div>
        </div>
        {time && (
          <p className='rounded-[5px] text-orange-500 bg-orange-500/10 inline-block py-[1px] px-[8px] text-xs'>
            {time}
          </p>
        )}
      </div>
      {permission && (
        <div className='flex justify-between gap-2 items-center overflow-hidden pb-1'>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className='shadow-md w-[40px] h-[30px] rounded-md flex justify-center items-center bg-[#E68B2D] hover:bg-orange-400 transition-colors cursor-pointer'
          >
            <AiOutlineReload size={20} color='white' />
          </div>
          <BaseButton
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className='w-full'
          >
            <span>{title}</span>
          </BaseButton>
        </div>
      )}
      {/* --- Product Details Section --- */}
      <div className={`shadow-sm px-3 py-2 flex justify-between items-center bg-[#EFF6FF4D] gap-x-3 mb-2 mt-2`}>
        <div className='rounded-lg w-[40px] h-[40px] overflow-hidden'>
          <img src={thumbnail ?? imageCardDefault} className='w-full h-full object-cover' alt={productName} />
        </div>
        <div className='flex-1'>
          <div className='flex justify-between items-start gap-x-2'>
            <h2 className='text-sm text-gray-900 line-clamp-2 break-words'>{productName}</h2>
            <span className='text-sm text-white bg-primary px-2 py-[2px] rounded font-normal'>
              {quantityNeed - quantityAvailble}
            </span>
          </div>
          {note && (
            <Tooltip title={note} color={theme?.primary} trigger={'hover'} placement='bottomLeft'>
              <div className='flex items-center gap-1.5 mt-1 text-gray-600 cursor-default w-fit'>
                <PiNotePencil size={16} className='flex-shrink-0' />
                <p className='text-sm font-normal line-clamp-1'>{note}</p>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      {reason && reason?.length > 0 && (
        <Tooltip
          title={
            <div>
              {reason.map((item: HistoryRequest, index: number) => (
                <p className='text-xs mb-1' key={item.id}>
                  Lý do làm lại (lần {(reason.length || 0) - index}): {item?.reason}
                </p>
              ))}
            </div>
          }
          color={theme?.primary}
          trigger='hover'
          placement='bottomLeft'
        >
          <div className='flex items-center gap-1.5 mt-1 text-red-600 cursor-default w-fit'>
            <PiNotePencil size={16} className='flex-shrink-0' />
            <p className='text-sm font-normal line-clamp-1'>Có yêu cầu làm lại</p>
          </div>
        </Tooltip>
      )}
    </div>
  );
}
