import React from 'react';
import { MdOutlineNoFood } from 'react-icons/md';
import { FiRefreshCcw } from 'react-icons/fi';

interface Props {
  data?: { CANCELED: number; REMADE: number };
}

const CancelRemadeSummary: React.FC<Props> = ({ data }) => {
  return (
    <div className='h-full flex flex-col gap-4 justify-center items-center py-6 m-h-[300px]'>
      {/* Tổng số món đã huỷ */}
      <div>
        <p className='text-base font-bold mb-2'>Tổng số món đã huỷ</p>
        <div className='border-2 py-2 px-8 flex border-primary rounded-md gap-2'>
          <div className='rounded-full w-12 h-12 text-white flex justify-center items-center bg-primary mr-2'>
            <MdOutlineNoFood size={28} />
          </div>
          <div className='flex flex-col justify-center items-center'>
            <p className='text-base font-bold text-primary text-center'>{data?.CANCELED || 0}</p>
            <p className='text-base font-bold'>Món</p>
          </div>
        </div>
      </div>

      {/* Tổng số món làm lại */}
      <div>
        <p className='text-base font-bold mb-2'>Tổng số món làm lại</p>
        <div className='border-2 py-2 px-8 flex border-primary rounded-md gap-2'>
          <div className='rounded-full w-12 h-12 text-white flex justify-center items-center bg-primary mr-2'>
            <FiRefreshCcw size={28} />
          </div>
          <div className='flex flex-col justify-center items-center'>
            <p className='text-base font-bold text-primary text-center'>{data?.REMADE || 0}</p>
            <p className='text-base font-bold'>Món</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelRemadeSummary;
