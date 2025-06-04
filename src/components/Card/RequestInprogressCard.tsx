import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BiDish } from 'react-icons/bi';
import { MdOutlinePayment, MdPerson } from 'react-icons/md';
import dayjs from 'dayjs';
import BaseButton from 'src/shared/components/Buttons/Button';
import { Request } from 'src/types/request.type';
import { RequestProductStatus, RequestType } from 'src/shared/common/enum';
import { Tooltip } from 'antd';
import { formatCurrency, getStatusLabel, generateImageURL } from 'src/shared/utils/utils';
import { FaAnglesDown, FaAnglesUp } from 'react-icons/fa6';
import { useTheme } from 'src/provider/ThemeContext';
import { LiaUserAstronautSolid } from 'react-icons/lia';
import { IoRestaurantOutline } from 'react-icons/io5';
interface RequestInprogressCardProps {
  request: Request;
  onViewDetails: () => void;
}

const getRequestTypeIcon = (type: string) => {
  switch (type) {
    case RequestType.ORDER:
      return <IoRestaurantOutline className='text-primary' size={30} />;
    case RequestType.PAYMENT:
      return <MdOutlinePayment className='text-success' size={30} />;
    case RequestType.STAFF:
      return <LiaUserAstronautSolid className='text-primary' size={30} />;
    default:
      return <BiDish className='text-gray-500' size={30} />;
  }
};
const RequestInprogressCard = React.memo(({ request, onViewDetails }: RequestInprogressCardProps) => {
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
  }, [request.requestProducts, updateScrollState]);

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.addEventListener('scroll', updateScrollState);
      return () => element.removeEventListener('scroll', updateScrollState);
    }
  }, [updateScrollState]);
  const customerName = request.sessionCustomer?.customer?.name || 'Không rõ';
  const tableName = request.table ? `${request.table.name} - ${request.table.zone.name}` : 'Không có bàn';
  const totalQuantity = request.requestProducts?.reduce((sum, product) => sum + product.quantity, 0) || 0;
  const employeeName = request.user?.name || 'không rõ';
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
  const { theme } = useTheme();

  return (
    <div
      onClick={() => {
        request.type === RequestType.ORDER && onViewDetails?.();
      }}
      className='bg-white rounded-xl shadow-lg p-4  mx-auto font-sans w-full flex flex-col border-b-4 border-primary'
    >
      {/* Header */}
      <div className='flex justify-between items-center pb-3'>
        <div className='flex items-center space-x-2 overflow-hidden max-w-full'>
          <div className='flex-shrink-0 min-w-[30px]'>{getRequestTypeIcon(request.type)}</div>
          <div className='overflow-hidden'>
            <Tooltip title={customerName} placement='top' color={theme?.primary}>
              <h3 className='font-semibold text-md line-clamp-2 break-words'>{customerName}</h3>
            </Tooltip>
            <Tooltip title={tableName} placement='top' color={theme?.primary}>
              <p className='text-sm text-gray-700 font-medium line-clamp-2 break-words'>{tableName}</p>
            </Tooltip>
          </div>
        </div>
        {/* <Tag color='orange'>{capitalizeFirstLetter(dayjs(request.createdAt).fromNow()).replace('tới', 'trước')}</Tag> */}
      </div>

      {/* Products Section */}
      <div className='py-4 flex-grow'>
        <div className='flex justify-between items-center'>
          <h3 className='font-semibold'>
            {request.type === RequestType.ORDER ? `Tống số món: ${totalQuantity}` : ''}

            {request.type === RequestType.STAFF ? `Nhân viên: ${employeeName}` : ''}
          </h3>
          {request.type === RequestType.STAFF && (
            <p className='text-sm text-gray-400 font-medium'>
              {' '}
              {request?.createdAt ? dayjs(request.createdAt).format('HH:mm') : 'Không rõ'}
            </p>
          )}
          {onViewDetails && request.type === RequestType.ORDER && (
            <p className='text-sm font-semibold text-primary cursor-pointer' onClick={onViewDetails}>
              Xem chi tiết
            </p>
          )}
        </div>

        {request.type === RequestType.ORDER && request.requestProducts?.length > 0 && (
          <div className='relative'>
            <div ref={containerRef} className='space-y-3 mt-2 overflow-y-auto px-[3px] max-h-44 hide-scrollbar pb-1'>
              {request.requestProducts.map((product, index) => {
                const productStatus = getStatusLabel(product.status as RequestProductStatus);
                return (
                  <div
                    key={product.id || index}
                    className='shadow-sm rounded-lg px-3 py-2 flex justify-between items-center gap-2 bg-[#EFF6FF4D]'
                  >
                    <div className='flex-1 min-w-0 flex items-center gap-[10px]'>
                      {product?.product?.thumbnail && (
                        <div className='max-w-10 min-h-10 rounded-md overflow-hidden'>
                          <img
                            className='w-full h-full object-cover'
                            src={generateImageURL(product?.product?.thumbnail)}
                            alt=''
                          />
                        </div>
                      )}
                      <div className='flex flex-col '>
                        {product?.status && (
                          <p
                            className={`w-fit px-2 py-1 mb-1 rounded-md text-[10px] font-medium ${productStatus.className}`}
                          >
                            {productStatus.text}
                          </p>
                        )}
                        <div className='flex gap-1 items-center'>
                          <p className='font-medium'>{product?.productName} </p>
                        </div>
                        {product?.note && (
                          <div className='flex items-center gap-1'>
                            <p className='text-xs text-gray-500 font-medium '>{product.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <span className='text-xs text-white bg-primary px-2 py-[2px] rounded font-medium'>
                        {`${product.servedQuantity} / ${product.quantity}`}
                      </span>
                    </div>
                  </div>
                );
              })}
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
        )}
      </div>

      {request.type === RequestType.PAYMENT && (
        <div className='flex gap-1'>
          <h4 className='font-semibold'>Tổng tiền: </h4>
          <span className='text-sm text-black'>{formatCurrency(request.paymentAmount)} VNĐ</span>
        </div>
      )}
      {!(request.type === RequestType.PAYMENT) && request.note && request.note.trim() !== '' && (
        <div className='pt-3 overflow-hidden break-words'>
          <h4 className='font-semibold'>Ghi chú đơn</h4>
          <p className='text-sm text-black bg-gray-50 rounded-md p-2'>{request.note || ''}</p>
        </div>
      )}
      {/* {request.type === RequestType.ORDER && (
        <div className='flex justify-between mt-4'>
          <BaseButton onClick={onViewDetails} className='w-full' type='primary'>
            Xem chi tiết
          </BaseButton>
        </div>
      )} */}
    </div>
  );
});

export default RequestInprogressCard;
