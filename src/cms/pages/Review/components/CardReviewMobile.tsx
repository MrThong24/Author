import { FC } from 'react';
import { FaRegStar } from 'react-icons/fa';
import { TiStarFullOutline } from 'react-icons/ti';
import dayjs from 'dayjs';
import { Review } from 'src/store/useReviewStore';

interface CardReviewProps {
  item: Review;
  average: Array<{ name: string }>;
  onClickReviewDetail: (id: string) => void;
}

const CardReviewMobile: FC<CardReviewProps> = ({ item, average, onClickReviewDetail }) => {
  const priorityOrder = average?.map((a) => a?.name) || [];
  const sortedArr = [...item?.ratingCriteria]?.sort((a, b) => {
    return priorityOrder.indexOf(a.criteria.name) - priorityOrder.indexOf(b.criteria.name);
  });

  return (
    <div
      className='flex gap-2 p-3 rounded-lg cursor-pointer items-center bg-white'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.09)' }}
      onClick={() => onClickReviewDetail(item.id)}
    >
      <div className='w-[40px] h-[40px] rounded-lg bg-primary-50 overflow-hidden flex items-center justify-center'>
        <FaRegStar className='text-primary' size={24} />
      </div>
      <div className='flex-1'>
        <div className='flex justify-between items-center'>
          <h2 className='font-medium'>{item?.customer?.name}</h2>
          <h2 className='font-thin text-[12px]'>{dayjs(item?.createdAt).format('HH:mm DD/MM/YYYY')}</h2>
        </div>
        <div className='flex gap-2 flex-wrap mt-2'>
          {sortedArr.map((rating) => (
            <div key={rating.id} className='flex gap-1 items-center border-r pr-2'>
              <p className='text-sm'>{rating.criteria.name}</p>
              <p className='text-sm ml'>{rating.star}</p>
              <TiStarFullOutline className='text-yellow-300 text-[20px]' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardReviewMobile;
