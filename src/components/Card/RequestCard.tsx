import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown, MenuProps, Tag, Tooltip } from 'antd';
import { BiDish } from 'react-icons/bi';
import { MdOutlinePayment, MdPerson } from 'react-icons/md';
import dayjs from 'dayjs';
import BaseButton from 'src/shared/components/Buttons/Button';
import { Request } from 'src/types/request.type';
import { RequestType } from 'src/shared/common/enum';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import { formatCurrency, generateImageURL } from 'src/shared/utils/utils';
import { FaAnglesDown, FaAnglesUp } from 'react-icons/fa6';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { useTheme } from 'src/provider/ThemeContext';
import useAuthStore from 'src/store/authStore';
import { HiDotsHorizontal } from 'react-icons/hi';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { LiaUserAstronautSolid } from 'react-icons/lia';
import { IoCloseCircleOutline, IoRestaurantOutline } from 'react-icons/io5';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import useOrderStore from 'src/store/useOrderStore';
interface RequestCardProps {
  request: Request;
  onAccept?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  onPayment?: () => void;
}

const getRequestTypeIcon = (type: string) => {
  switch (type) {
    case RequestType.ORDER:
      return <IoRestaurantOutline className=' min-w-[30px] text-primary' size={30} />;
    case RequestType.PAYMENT:
      return <MdOutlinePayment className=' min-w-[30px] text-success' size={30} />;
    case RequestType.STAFF:
      return <LiaUserAstronautSolid className=' min-w-[30px] text-primary' size={30} />;
    default:
      return <BiDish className=' min-w-[30px] text-gray-500' size={30} />;
  }
};

const RequestCard = React.memo(({ request, onAccept, onReject, onViewDetails, onPayment }: RequestCardProps) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const { currentUser } = useAuthStore();
  const { loadingCreateOrder, idRequest } = useOrderStore();
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

  const { getQuery } = useUrlQuery();
  const queryType = getQuery('type');
  const customerName = useMemo(() => request.sessionCustomer?.customer?.name || 'Không rõ', [request.sessionCustomer]);

  const tableName = useMemo(
    () => (request.table ? `${request.table.name} - ${request.table.zone.name}` : 'Không có bàn'),
    [request.table]
  );

  const totalQuantity = useMemo(() => {
    return request.requestProducts?.reduce((sum, product) => sum + product.quantity, 0) || 0;
  }, [request.requestProducts]);

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

  // const items: MenuProps['items'] = [
  //   {
  //     label: <span className='text-danger'>Từ chối</span>,
  //     key: '0',
  //     icon: <IoMdCloseCircleOutline className='text-danger' size={24} />,
  //     onClick: onReject
  //   }
  // ];
  return (
    <div
      onClick={() => {
        request.type === RequestType.ORDER && onViewDetails?.();
      }}
      className='bg-white rounded-xl shadow-lg p-4  mx-auto font-sans w-full border-b-4 border-primary flex flex-col'
    >
      {/* Header */}
      <div className='flex justify-between items-center pb-3 space-x-2'>
        <div className='flex items-center space-x-2 overflow-hidden max-w-[75%]'>
          {getRequestTypeIcon(request.type)}
          <div className='overflow-hidden'>
            <Tooltip title={customerName} placement='top' color={theme?.primary}>
              <h3 className='font-semibold text-md line-clamp-2 break-words'>{customerName}</h3>
            </Tooltip>
            <Tooltip title={tableName} placement='top' color={theme?.primary}>
              <p className='text-sm text-gray-700 font-medium line-clamp-2 break-words'>{tableName}</p>
            </Tooltip>
          </div>
        </div>
        <Tag color='orange' className='flex-shrink-0'>
          {capitalizeFirstLetter(dayjs(request.createdAt).fromNow())}
        </Tag>
      </div>

      {/* Action Buttons */}
      {(onAccept || onReject) && !(request.type === RequestType.PAYMENT) && (
        <div className='flex justify-between gap-2 items-center'>
          {onReject && (
            // <Dropdown menu={{ items }} trigger={['click']}>
            //   <div className='shadow-md rounded-md'>
            //     <BaseButton variant={'link'} className='px-2 bg-white' onClick={(e) => e.preventDefault()}>
            //       <HiDotsHorizontal size={22} className='text-gray-500' />
            //     </BaseButton>
            //   </div>
            // </Dropdown>
            <div
              className='shadow-md w-[40px] h-[32px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer'
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              <IoCloseCircleOutline size={24} className='text-white' />
            </div>
          )}
          {onAccept && (
            <BaseButton
              className='w-full'
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
            >
              {request.type === RequestType.ORDER
                ? currentUser?.currentUserStore?.store?.kitchenDisabled
                  ? 'Xác nhận'
                  : 'Chuyển bếp'
                : 'Xác nhận'}
            </BaseButton>
          )}
        </div>
      )}

      {/* Products Section */}
      <div className='py-4 flex-grow'>
        <div className='flex justify-between items-center'>
          <h3 className='font-semibold'>
            {request.type === RequestType.ORDER ? `Tổng số món: ${totalQuantity}` : ''}
            {request.type === RequestType.PAYMENT
              ? `Tổng tiền: ${formatCurrencyDecimalVND(request?.paymentAmount as number)} VNĐ`
              : ''}
            {request.type === RequestType.STAFF && queryType === 'null' ? 'Nhân viên: ' : ''}
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
            <div
              ref={containerRef}
              onScroll={updateScrollState}
              className='space-y-3 mt-2 overflow-y-auto max-h-44 px-[3px] hide-scrollbar pb-1'
            >
              {request.requestProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className='shadow-sm rounded-lg px-3 py-2 flex justify-between items-center bg-[#EFF6FF4D]'
                >
                  <div className='flex items-center gap-[10px]'>
                    {product?.product?.thumbnail && (
                      <div className='max-w-10 min-h-10 rounded-md overflow-hidden'>
                        <img
                          className='w-full h-full object-cover'
                          src={generateImageURL(product?.product?.thumbnail)}
                          alt=''
                        />
                      </div>
                    )}
                    <div>
                      <p className='font-medium'>{product.productName}</p>
                      {product?.note && product?.note.trim() !== '' && (
                        <div className='flex items-center gap-1'>
                          <p className='text-xs text-gray-500 font-medium whitespace-pre-line'>{product?.note || ''}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className='text-xs text-white bg-primary px-2 py-[2px] rounded font-medium'>
                    {product.quantity}
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
        )}

        {request.type === RequestType.STAFF && request.problems && (
          <div className='mt-2 text-sm text-gray-600 flex flex-wrap gap-2 items-center'>
            <strong>Vấn đề:</strong>{' '}
            {Array.isArray(request.problems) ? (
              request.problems.map((problem, index) => (
                <BaseButton variant={'text'} className='border-none cursor-auto text-primary bg-primary-50'>
                  {problem}
                </BaseButton>
              ))
            ) : (
              <BaseButton variant={'text'} className='border-none cursor-auto text-primary bg-primary-50'>
                {request.problems}
              </BaseButton>
            )}
          </div>
        )}
      </div>

      {/* Note Section */}
      {/* {!(request.type === RequestType.PAYMENT) && (
        <div className='pt-3'>
          <h4 className='font-semibold'>Ghi chú</h4>
          {/* <p className='text-sm text-black'>{request.note || 'Không ghi chú'}</p> */}
      {/* <p className='text-sm text-black'>{request.note || ' '}</p>
        </div>
      )} */}
      {!(request.type === RequestType.PAYMENT) && request.note && request.note.trim() !== '' && (
        <div className='pt-3 overflow-hidden break-words'>
          <h4 className='font-semibold'>Ghi chú đơn</h4>
          <p className='text-sm text-black bg-gray-50 rounded-md p-2'>{request.note || ''}</p>
        </div>
      )}

      {request.type === RequestType.PAYMENT && (
        <div className='flex justify-between mt-4'>
          <BaseButton
            loading={loadingCreateOrder && request?.id === idRequest}
            onClick={onPayment}
            className='w-full'
            type='primary'
          >
            Thanh toán
          </BaseButton>
        </div>
      )}
    </div>
  );
});

export default RequestCard;
