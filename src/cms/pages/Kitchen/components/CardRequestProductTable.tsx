import { Dropdown, Image } from 'antd';
import { MenuProps } from 'antd/lib';
import { useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FiXCircle } from 'react-icons/fi';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { imageCardDefault } from 'src/assets/images';
import { SlClose } from 'react-icons/sl';
import { IoClose } from 'react-icons/io5';
import { AiOutlinePrinter } from 'react-icons/ai';

interface ICardRequestProductProps {
  productName: string;
  note?: string | null;
  table?: string;
  quantityNeed: number;
  quantityAvailble: number;
  title: string;
  onConfirm: any;
  onCancel: any;
  time?: string;
  reason?: string | null;
  permission: boolean;
  thumbnail: string;
  isPrintEnabled?: boolean;
  onPrint?: () => void;
}

export default function CardRequestProductTable({
  productName,
  quantityNeed,
  quantityAvailble,
  title,
  onConfirm,
  onCancel,
  permission,
  thumbnail,
  isPrintEnabled = false,
  onPrint = () => {}
}: ICardRequestProductProps) {
  return (
    <div
      className='bg-white p-[10px] rounded-[5px] mb-[15px] h-full'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}
    >
      <div className='flex  items-center justify-between h-full'>
        <div className='flex gap-x-[10px] items-center flex-1'>
          <div className='rounded-[5px] w-[80px] h-[80px] overflow-hidden bg-red-200 relative'>
            <img src={thumbnail ?? imageCardDefault} className='w-full h-full object-cover' alt='' />

            <div className='absolute inset-0 bg-black/20' />

            <div className='text-[14px] text-white bg-primary px-[4px] py-[2px] rounded-[5px] font-medium absolute top-0 right-0 min-w-[50%] text-center z-10'>
              {quantityAvailble || 0} / {quantityNeed || 0}
            </div>
          </div>
          <h2 className='text-sm font-medium line-clamp-2 hidden sm:flex md:hidden'>{productName}</h2>
          <div className='flex-1 h-full'>
            <div className='flex sm:hidden md:flex justify-between items-center'>
              <h2 className='text-sm font-medium line-clamp-2 flex-1'>{productName}</h2>
              {permission && (
                <div className='flex items-center gap-x-[10px] w-[170px] justify-end'>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel();
                    }}
                    className='shadow-md w-[50px] h-[40px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer'
                  >
                    <SlClose size={22} color='white' />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm();
                    }}
                    className='bg-primary text-white flex items-center gap-x-[8px] w-[150px] px-2 rounded-[6px] py-[10px] cursor-pointer text-[14px] hover:bg-primary-400 transition-colors'
                  >
                    <FaRegCircleCheck size={22} /> <p className='whitespace-nowrap'>{title}</p>
                  </div>
                </div>
              )}
            </div>
            <div className='flex sm:hidden md:flex justify-end mt-2'>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint();
                }}
                className={`shadow-md w-[40px] h-[40px] rounded-md flex justify-center items-center border-primary border  cursor-pointer `}
              >
                <AiOutlinePrinter size={22} className='text-primary' />
              </div>
            </div>
          </div>
        </div>

        <div className='gap-4 justify-end flex-[0.3] sm:flex md:hidden hidden'>
          <div className='flex justify-between items-start'>
            {permission && (
              <div className='flex items-center justify-end gap-x-[10px] w-[240px]'>
                {isPrintEnabled && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrint();
                    }}
                    className={`shadow-md w-[40px] h-[40px] rounded-md flex justify-center items-center border-primary border  cursor-pointer`}
                  >
                    <AiOutlinePrinter size={22} className='text-primary' />
                  </div>
                )}

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
                  className='bg-primary text-white flex items-center gap-x-[8px] w-[150px] px-2 rounded-[6px] py-[10px] cursor-pointer text-[14px] hover:bg-primary-400 transition-colors'
                >
                  <FaRegCircleCheck size={22} /> <p className='whitespace-nowrap'>{title}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
