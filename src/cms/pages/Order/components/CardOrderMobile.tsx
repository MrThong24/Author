import React from 'react';
import { FaRegFileAlt } from 'react-icons/fa';
import { OrderStatus } from 'src/shared/common/enum';
import { twMerge } from 'tailwind-merge';
interface IProps {
  code: string;
  zoneAndtable: string;
  customerName: string;
  isCreatedEInvoice: boolean;
  status: string;
  onClick: () => void;
}
export default function CardOrderMobile({
  code,
  zoneAndtable,
  isCreatedEInvoice,
  customerName,
  status,
  onClick
}: IProps) {
  return (
    <div
      onClick={onClick}
      className='flex items-center p-[10px] rounded-lg gap-[10px] shadow-[0px_0px_15px_0px_rgba(0,0,0,0.05)] bg-white'
    >
      <div className='p-[10px] rounded-lg bg-primary-50'>
        <FaRegFileAlt size={20} className='text-primary' />
      </div>
      <div className='w-full'>
        <div className='flex items-center justify-between text-sx leading-6'>
          <p className='font-semibold flex-1'>{code || ''}</p>
          {status && (
            <div
              className={twMerge(
                `flex w-[140px] gap-[6px] items-center justify-end px-2 py-1 ${status === OrderStatus.PAID ? 'text-[#15803D]' : 'text-danger'}`
              )}
            >
              <span
                className={twMerge(
                  `w-[6px] h-[6px] rounded-full bg-[#15803D] ${status === OrderStatus.UNPAID ? 'bg-danger' : ''}`
                )}
              ></span>
              <span className='text-sx font-medium'>
                {status === OrderStatus.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center justify-between mt-[6px]'>
          <p className='line-clamp-1 flex-1'>
            {zoneAndtable || ''} - {customerName || ''}
          </p>
          <div
            className={twMerge(
              `w-[140px] flex gap-[6px] items-center justify-end px-2 py-1 ${isCreatedEInvoice ? 'text-[#15803D]' : 'text-danger'}`
            )}
          >
            <span
              className={twMerge(`w-[6px] h-[6px] rounded-full ${isCreatedEInvoice ? 'bg-[#15803D]' : 'bg-danger'}`)}
            />
            <span className='text-sx font-medium'>{isCreatedEInvoice ? 'Đã tạo HDDT' : 'Chưa tạo HDDT'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
