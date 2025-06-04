import React from 'react';

interface TotalProps {
  data?: { title: string; value: string | number }[];
}

const TotalList: React.FC<TotalProps> = ({ data = [] }) => {
  return (
    <div className='grid grid-cols-2  xl:grid-cols-4 gap-4 lg:gap-6 mt-4'>
      {data.map((item, index) => (
        <div key={index} className='flex items-center flex-col text-center rounded-md shadow-base bg-white p-3'>
          <span className='uppercase font-normal text-xs lg:text-lg'>{item?.title}</span>
          <span className='font-bold text-base sm:text-xl lg:text-2xl text-primary'>{item?.value}</span>
        </div>
      ))}
    </div>
  );
};

export default TotalList;
