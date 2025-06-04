import { Divider } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaAnglesDown, FaAnglesUp } from 'react-icons/fa6';
import { RequestProductStatus } from 'src/shared/common/enum';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import BaseButton from 'src/shared/components/Buttons/Button';
import { formatCurrency, formatDate, formatTime } from 'src/shared/utils/utils';
import { Request, RequestProduct } from 'src/types/request.type';

interface RequestHistoryCardProps {
  index: number;
  request?: Request;
}

const RequestHistoryCard: React.FC<RequestHistoryCardProps> = ({ index, request }) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
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
  }, [request?.requestProducts, updateScrollState]);

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

  const getTotalAmount = (requestProducts: RequestProduct[] | undefined) => {
    return (
      requestProducts
        ?.filter((requestProduct) => requestProduct.status !== RequestProductStatus.CANCELED)
        ?.reduce((accumulator, currentValue) => accumulator + currentValue.price * currentValue.quantity, 0) || 0
    );
  };
  return (
    <div className='bg-white p-4 pb-10 md:pb-0 shadow-sm rounded-md relative'>
      <div className='flex gap-x-2 mb-4'>
        <div className='bg-primary text-white rounded-md px-4 py-2 h-fit whitespace-nowrap'>Lượt {index}</div>
        <div>
          <p className='text-sm font-semibold'>{request?.sessionCustomer?.customer?.name}</p>
          <p className='text-xs'>{request?.user?.name} đã xác nhận đơn</p>
        </div>
      </div>
      <div className='flex justify-between font-semibold'>
        <p>{formatDate(request?.createdAt)}</p>
        <p>{formatTime(request?.createdAt)}</p>
      </div>
      <Divider className='my-3' />
      <div ref={containerRef} className='h-[200px] overflow-y-auto'>
        <table className='w-full'>
          <tr>
            <th className='pb-2 text-left text-xs text-[#A6A6A6]'>Tên món</th>
            <th className='pb-2 text-center text-xs text-[#A6A6A6]'>Số lượng</th>
            <th className='pb-2 text-left text-xs text-[#A6A6A6]'>Giá tiền (VNĐ)</th>
          </tr>
          <tbody>
            {request?.requestProducts
              ?.filter((requestProduct) => requestProduct.status !== RequestProductStatus.CANCELED)
              ?.map((requestProduct) => (
                <tr className='font-semibold'>
                  <td>{requestProduct?.productName}</td>
                  <td className='text-center'>{requestProduct?.quantity}</td>
                  <td>{formatCurrencyDecimalVND(requestProduct?.price * requestProduct?.quantity)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {hasScroll && (
        <button
          className='absolute bottom-[36px] left-1/2 transform -translate-x-1/2 rounded-full p-2 bg-primary-50 text-primary'
          onClick={(e) => {
            e.stopPropagation();
            handleScrollButtonClick();
          }}
        >
          {!isAtBottom ? <FaAnglesDown size={16} /> : <FaAnglesUp size={16} />}
        </button>
      )}
      <Divider className='my-3' />
      <div className='flex justify-between font-bold text-base text-[#464646]'>
        <p>Tổng cộng</p>
        <p>{formatCurrencyDecimalVND(getTotalAmount(request?.requestProducts))} VNĐ</p>
      </div>
    </div>
  );
};

export default RequestHistoryCard;
