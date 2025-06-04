import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { FaAnglesDown, FaAnglesUp } from 'react-icons/fa6';
import BaseButton from 'src/shared/components/Buttons/Button';
import { Tag, Tooltip } from 'antd';
import { useTheme } from 'src/provider/ThemeContext';
import { LuHandPlatter } from 'react-icons/lu';

interface RequestCardProps {
  item: {
    name: string;
  };
  subItem: any;
  onRemade: () => void;
  onServe: () => void;
  onViewDetail: () => void;
}

const RequestCardPending: React.FC<RequestCardProps> = ({ item, subItem, onRemade, onServe, onViewDetail }) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const updateScrollState = useCallback(() => {
    const element = containerRef.current;
    if (element) {
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const scrollTop = element.scrollTop;
      const bottomReached = scrollHeight - scrollTop <= clientHeight + 1;
      setHasScroll(scrollHeight > clientHeight);
      setIsAtBottom(bottomReached);
    } else {
      setHasScroll(false);
      setIsAtBottom(false);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [item, updateScrollState]);

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.addEventListener('scroll', updateScrollState);
      return () => element.removeEventListener('scroll', updateScrollState);
    }
  }, [updateScrollState]);

  const handleScrollButtonClick = () => {
    if (containerRef.current) {
      // Check if the scroll is currently at the bottom
      if (isAtBottom) {
        // If at the bottom, scroll to the top smoothly
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // If not at the bottom, scroll down smoothly
        containerRef.current.scrollBy({
          top: 100, // Or your desired scroll amount
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className='bg-white rounded-xl p-4  mx-auto font-sans w-full border-b-4 border-primary flex flex-col shadow-base h-full'>
      <div className='flex justify-between items-center pb-3 space-x-2'>
        <div className='flex items-center space-x-2 overflow-hidden max-w-[75%]'>
          <LuHandPlatter className=' min-w-[30px] text-primary' size={30} />
          <div className='overflow-hidden'>
            <Tooltip title={item?.name} placement='top' color={theme?.primary}>
              <h3 className='font-semibold text-md line-clamp-2 break-words'>{item?.name}</h3>
            </Tooltip>
            <Tooltip title={subItem?.customerName} placement='top' color={theme?.primary}>
              <p className='text-sm text-gray-700 font-medium line-clamp-2 break-words'>{subItem?.customerName}</p>
            </Tooltip>
          </div>
        </div>
        <Tag color='orange' className='flex-shrink-0'>
          {subItem?.confirmedAt}
        </Tag>
      </div>
      <div className='flex flex-row items-center gap-2'>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onRemade();
          }}
          className='shadow-md w-[40px] h-[30px] rounded-md flex justify-center items-center bg-[#E68B2D] hover:bg-orange-400 transition-colors cursor-pointer'
        >
          <AiOutlineReload size={20} color='white' />
        </div>
        <BaseButton
          className='w-full'
          onClick={(e) => {
            e.stopPropagation();
            onServe();
          }}
        >
          Phục vụ
        </BaseButton>
      </div>
      <div className='py-4 flex-grow'>
        <div className='flex justify-between items-center'>
          <h3 className='font-semibold'>
            Tổng số món:
            {subItem?.list?.reduce((acc: number, cur: any) => {
              return acc + (cur.completedQuantity - cur.servedQuantity);
            }, 0)}
          </h3>
          <p className='text-sm font-semibold text-primary cursor-pointer' onClick={onViewDetail}>
            Xem chi tiết
          </p>
        </div>

        <div className='relative'>
          <div
            ref={containerRef}
            onScroll={updateScrollState}
            className='space-y-3 mt-2 overflow-y-auto max-h-44 px-[3px] hide-scrollbar pb-1'
          >
            {subItem?.list?.map((product: any) => (
              <div
                key={product?.key}
                className='shadow-sm rounded-lg px-3 py-2 flex justify-between items-center bg-[#EFF6FF4D]'
              >
                <div className='flex items-center gap-[10px]'>
                  <div>
                    <p className='font-medium'>{product.name}</p>
                    {product?.note && product?.note.trim() !== '' && (
                      <div className='flex items-center gap-1'>
                        <p className='text-xs text-gray-500 font-medium whitespace-pre-line'>{product?.note || ''}</p>
                      </div>
                    )}
                  </div>
                </div>
                <span className='text-xs text-white bg-primary px-2 py-[2px] rounded font-medium'>
                  {product.completedQuantity - product.servedQuantity}
                </span>
              </div>
            ))}
          </div>
          {hasScroll && (
            <BaseButton
              className='absolute -bottom-[18px] left-1/2 transform -translate-x-1/2'
              shape='circle'
              variant='filled'
              onClick={(e) => {
                e.stopPropagation();
                handleScrollButtonClick();
              }}
            >
              {!isAtBottom ? <FaAnglesDown /> : <FaAnglesUp />}
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCardPending;
