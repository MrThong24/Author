import { Dropdown, Tooltip } from 'antd';
import { MenuProps } from 'antd/lib';
import { useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FiXCircle } from 'react-icons/fi';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { AiOutlineUser } from 'react-icons/ai';
import { useTheme } from 'src/provider/ThemeContext';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import { HistoryRequest } from 'src/types/request.type';
import { PiNotePencil } from 'react-icons/pi';
import { SlClose } from 'react-icons/sl';
interface ICardRequestProductProps {
  customerName: string;
  note?: string | null;
  reason?: HistoryRequest[];
  tableAndZoneName: string;
  quantityNeed: number;
  quantityAvailble: number;
  title: string;
  onConfirm: any;
  onCancel: any;
  time: string;
  permission: boolean;
}

export default function CardRequestProductByCustomer({
  customerName,
  note,
  reason,
  tableAndZoneName,
  quantityNeed,
  quantityAvailble,
  title,
  onConfirm,
  onCancel,
  time,
  permission
}: ICardRequestProductProps) {
  const { theme } = useTheme();

  return (
    <div
      className='bg-white p-[10px] rounded-[5px] mb-[15px] h-full'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}
    >
      <div className='flex flex-col gap-[15]'>
        <div className='flex justify-between mb-[15px]'>
          <p className='text-black text-[15px] font-medium flex-1'>{tableAndZoneName}</p>
          {permission && (
            <div className='flex items-center gap-x-[10px] w-[170px] justify-end'>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className='shadow-md w-[30px] h-[30px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer'
              >
                <SlClose size={20} color='white' />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
                className='bg-primary text-white flex items-center gap-x-[10px] px-2 rounded-[5px] py-[5px] cursor-pointer text-[12px] hover:bg-primary-400 transition-colors'
              >
                <FaRegCircleCheck size={20} /> <span>{title}</span>
              </div>
            </div>
          )}
        </div>
        <div className='flex gap-x-[10px] items-center justify-between'>
          <div className='flex gap-x-[10px] items-center'>
            <div>
              <div className='flex gap-x-[5px] items-center'>
                <p className='text-[13px] font-medium text-primary flex gap-x-[5px]'>
                  <AiOutlineUser size={20} /> <span className='line-clamp-1'>{customerName}</span>
                </p>
                <p className='rounded-[5px] text-green-500 bg-green-500/10 inline-block py-[1px] px-[8px] text-[10px]'>
                  {capitalizeFirstLetter(dayjs(time).fromNow()).replace('tới', 'trước')}
                </p>
              </div>
              {note && (
                <Tooltip title={note} color={theme?.primary} trigger={'hover'}>
                  <div className='flex gap-2 items-center text-[#595959] w-fit'>
                    <PiNotePencil size={18} className='text-[16px] min-w-[16px]' />
                    <p className='font-light line-clamp-1'>{note}</p>
                  </div>
                </Tooltip>
              )}
              {reason && reason?.length > 0 && (
                <Tooltip
                  title={
                    <div>
                      {reason &&
                        reason?.length > 0 &&
                        reason.map((item: HistoryRequest, index: number) => (
                          <p className='text-sm' key={item.id}>
                            Lý do làm lại (lần {(reason?.length || 0) - index}) {item?.reason}
                          </p>
                        ))}
                    </div>
                  }
                  color={theme?.primary}
                  trigger='hover'
                >
                  <div
                    className='flex gap-2 items-center text-[#595959] w-fit'
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <PiNotePencil size={18} className='text-[16px] text-danger min-w-[16px]' />
                    <p className='font-light text-danger text-sm line-clamp-1'>Có yêu cầu làm lại</p>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
          <div className='text-sm text-white bg-primary py-[3.5px] px-[5px] rounded-[5px] font-semibold'>
            <p>
              {quantityAvailble || 0}/{quantityNeed || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
