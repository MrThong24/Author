import React from 'react';
import Rating from './Rating';
import { Tooltip } from 'antd';

interface RatingReportProps {
  ratings: { name: string; value: number }[];
  totalRating: number;
}

const RatingReport: React.FC<RatingReportProps> = ({ ratings, totalRating }) => {
  return (
    <div className='flex w-full flex-wrap justify-center items-center h-[calc(100%-60px)] gap-4'>
      {!!ratings?.length && (
        <div className='mt-4'>
          {ratings.map((rating, index) => (
            <div
              key={index}
              className='flex flex-wrap mbsm:flex-nowrap lg:flex-wrap items-center justify-center mbsm:justify-start lg:justify-center mb-3'
            >
              <span className='w-[140px] font-medium text-sm text-primary'>{rating.name}:</span>
              <Tooltip title={`Trung bình: ${rating.value}`} placement='right'>
                <div>
                  <Rating rate={rating.value} fiveStar />
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
      <div className='ml-4 flex items-center justify-center text-primary text-center'>
        <div className='flex  lg:flex-col items-center gap-1 lg:gap-0'>
          <div className=' font-medium  text-base 2xl:text-base'>Tổng</div>
          <div className=' text-xl  2xl:text-4xl font-bold'>{totalRating}</div>
          <div className='text-base  2xl:text-base font-medium'>lượt đánh giá</div>
        </div>
      </div>
    </div>
  );
};

export default RatingReport;
