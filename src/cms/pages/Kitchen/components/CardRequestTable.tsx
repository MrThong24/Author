import { Dropdown } from 'antd';
import { MenuProps } from 'antd/lib';
import { useState } from 'react';
import { AiOutlinePrinter, AiOutlineReload } from 'react-icons/ai';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { FiMoreHorizontal, FiXCircle } from 'react-icons/fi';
import { SlClose } from 'react-icons/sl';

interface ICardRequestTableProps {
  table: string;
  quantityNeed: number;
  quantityAvailable: number;
  title: string;
  onConfirm: any;
  onCancel: any;
  type?: string;
  permission: boolean;
  isPrintEnabled?: boolean;
  onPrint?: () => void;
}

export default function CardRequestTable({
  table,
  quantityNeed,
  quantityAvailable,
  title,
  onConfirm,
  onCancel,
  permission,
  isPrintEnabled = false,
  onPrint = () => {}
}: ICardRequestTableProps) {
  return (
    <div className='p-[10px] rounded-[5px] bg-white' style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}>
      <div className='flex justify-between'>
        <h2 className='text-sm font-medium flex-1 text-black'>{table}</h2>

        <div className='flex justify-between'>
          {permission && (
            <div className='flex items-end gap-x-[10px] w-[170px] justify-end'>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className={`shadow-md w-[50px] h-[40px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer`}
              >
                <SlClose size={22} color='white' />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
                className={`bg-primary text-white flex items-center gap-x-[8px] w-[150px] px-2 rounded-[6px] py-[10px] cursor-pointer text-[14px] hover:bg-primary-400 transition-colors`}
              >
                <FaRegCircleCheck size={22} /> <p className='whitespace-nowrap'>{title}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='flex justify-between mt-2 items-center'>
        <div className='text-[12px] font-normal flex flex-col gap-1'>
          <div className='flex items-center gap-1'>
            <span className='font-light'>Số lượng cần {title}:</span>
            <span className='text-black font-semibold'>{quantityNeed}</span>
          </div>
          <div className='flex items-center gap-1'>
            <span className='font-light'>Số lượng đã {title}:</span>
            <span className='text-black font-semibold'>{quantityAvailable}</span>
          </div>
        </div>
        <div>
          {isPrintEnabled && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onPrint();
              }}
              className={`shadow-md w-[50px] h-[40px] rounded-md flex justify-center items-center border-primary border  cursor-pointer `}
            >
              <AiOutlinePrinter size={22} className='text-primary' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
