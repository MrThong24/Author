import { Drawer, Tag, theme } from 'antd';
import { Request } from 'src/types/request.type';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import BaseButton from 'src/shared/components/Buttons/Button';
import { FaMinus, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import BaseInput from 'src/shared/components/Core/Input';
import { RequestStatus, RequestType } from 'src/shared/common/enum';
import useRequestStore from 'src/store/useRequestStore';
import ModalRejectRequest from './ModalRejectRequest/ModalRejectRequest';
import { BiDish } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { MdOutlinePayment, MdPerson } from 'react-icons/md';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import { requestTitle } from 'src/shared/utils/request';
import useAuthStore from 'src/store/authStore';
import { useTheme } from 'src/provider/ThemeContext';
import { FaRegPenToSquare } from 'react-icons/fa6';

interface RequestDrawerProps {
  isOpen: boolean;
  request: Request | null;
  onClose: () => void;
  isHistory?: boolean;
}

const RequestDrawer: React.FC<RequestDrawerProps> = ({ isOpen, request, onClose, isHistory }) => {
  const { currentUser } = useAuthStore();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [products, setProducts] = useState(request?.requestProducts || []);
  const { confirmOrRejectRequest } = useRequestStore();
  const [isOpenModalCancel, SetIsOpenModalCancel] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const { theme } = useTheme();
  useEffect(() => {
    if (request) {
      setCurrentRequest(request);
    }
  }, [request]);

  useEffect(() => {
    if (request?.requestProducts) {
      setProducts(request.requestProducts);
    }
  }, [request]);

  const handleQuantityChange = (productId: string, value: number) => {
    setProducts((prev) =>
      prev.map((product) => (product.productId === productId ? { ...product, quantity: Math.max(1, value) } : product))
    );
  };

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, productId] : prev.filter((itemId) => itemId !== productId)));
  };

  const handleDeleteSelected = () => {
    setProducts((prev) => prev.filter((product) => !selectedItems.includes(product.productId)));
    setSelectedItems([]);
  };

  const totalAmount = products.reduce((total, product) => total + product.price * product.quantity, 0);

  const handleSave = async () => {
    if (!request?.id) return;
    try {
      const updatedProducts = products.map(({ productId, ...rest }) => ({
        ...rest,
        productId: productId,
        id: productId
      }));
      await confirmOrRejectRequest(request?.id, {
        status: RequestStatus.INPROGRESS,
        requestProducts: updatedProducts,
        rejectReason: ''
      });
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu:', error);
    }
  };

  const handleOpenModalReject = () => {
    SetIsOpenModalCancel(true);
  };

  const handleConfirm = async () => {
    if (!request?.id) return;
    try {
      await confirmOrRejectRequest(request?.id, {
        status: RequestStatus.CONFIRMED,
        rejectReason: ''
      });
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu:', error);
    }
  };

  const handleReject = async (reason: string) => {
    if (!currentRequest?.id) return;
    try {
      await confirmOrRejectRequest(currentRequest?.id, {
        status: RequestStatus.REJECTED,
        rejectReason: reason
      });
      onClose();
      SetIsOpenModalCancel(false);
    } catch (error) {
      console.error('Lỗi khi hủy yêu cầu:', error);
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case RequestType.ORDER:
        return <BiDish className='text-danger' size={30} />;
      case RequestType.PAYMENT:
        return <MdOutlinePayment className='text-success' size={30} />;
      case RequestType.STAFF:
        return <MdPerson className='text-primary' size={30} />;
      default:
        return <BiDish className='text-gray-500' size={30} />;
    }
  };
  // Nội dung bên trong Drawer
  const drawerContent = (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-4'>
        <div className='flex justify-between items-center'>
          <h2 className='text-lg font-semibold'>Chi tiết {requestTitle(request?.type || '').toLocaleLowerCase()}</h2>
          <span
            className='cursor-pointer text-danger font-bold'
            onClick={() => {
              setSelectedItems([]);
              onClose();
            }}
          >
            <IoMdClose size={25} />
          </span>
        </div>
        <div className='flex items-start gap-2 mt-5'>
          <div className='flex gap-2 items-center'>
            {getRequestTypeIcon(request?.type || '')}
            <div className='flex flex-col gap-1'>
              <p className='flex flex-wrap gap-1 font-semibold'>
                Khách hàng: {request?.sessionCustomer?.customer?.name || 'Không rõ'}
                <Tag color='orange'>
                  {capitalizeFirstLetter(dayjs(request?.createdAt).fromNow()).replace('tới', 'trước')}
                </Tag>
              </p>
              <p className='text-gray-500'>
                {request?.table?.zone?.name || 'Không rõ'} - {request?.table?.name || 'Không rõ'}
              </p>
            </div>
          </div>
        </div>
      </div>
      {request?.type === RequestType.ORDER &&
        !isHistory &&
        request?.status !== RequestStatus.INPROGRESS &&
        request?.status !== RequestStatus.REJECTED &&
        request?.status !== RequestStatus.CANCELED && (
          <div className='flex justify-between p-4 items-center'>
            <div>
              <p className='font-semibold'>Danh sách món yêu cầu</p>
              <p className='text-gray-500'>
                {selectedItems.length > 0 ? `Đã chọn ${selectedItems.length} món` : ''} &nbsp;
              </p>
            </div>

            <div className='flex gap-2 items-center'>
              {selectedItems.length > 0 && (
                <span className='font-semibold text-gray-600 cursor-pointer' onClick={() => setSelectedItems([])}>
                  Hủy xóa
                </span>
              )}
              <BaseButton
                icon={<FaRegTrashAlt />}
                disabled={!selectedItems.length}
                type='primary'
                className='hover:!bg-red-500 active:!bg-red-500 bg-red-600'
                onClick={handleDeleteSelected}
              >
                Xoá
              </BaseButton>
            </div>
          </div>
        )}
      {/* Nội dung cuộn (Danh sách món) */}
      <div className='overflow-y-auto px-4 py-2'>
        {request && (
          <>
            {request.type === RequestType.ORDER && (
              <div className='flex flex-col gap-4'>
                {/* Danh sách món */}
                {products.map((item) => (
                  <div
                    key={item.productId}
                    className='flex justify-between py-2 px-2 rounded-md bg-[#EFF6FF4D] shadow-sm'
                  >
                    {!isHistory &&
                      request?.status !== RequestStatus.INPROGRESS &&
                      request?.status !== RequestStatus.REJECTED &&
                      request?.status !== RequestStatus.CANCELED && (
                        <div className='flex items-center mr-2'>
                          <BaseCheckbox
                            checked={selectedItems.includes(item.productId)}
                            onChange={(e) => handleCheckboxChange(item.productId, e.target.checked)}
                          />
                        </div>
                      )}

                    <div className='flex-1 flex flex-col items-start text-left justify-center'>
                      <span className='font-semibold'>
                        {item.productName} <span className='ml-0.5 text-primary'>{`x${item.quantity}`}</span>
                      </span>
                      {/* <span className='text-gray-500'>{item.note || 'Không ghi chú '}</span> */}
                      <span className='text-gray-500 text-[0.8rem]'>
                        Đơn giá: {formatCurrencyDecimalVND(item.price)} VNĐ
                      </span>
                      {item.note && item.note.trim() !== '' && (
                        <span className='text-gray-600 flex items-center gap-1 text-[0.8rem]'>
                          <span className='w-4'>
                            <FaRegPenToSquare className=' text-gray-500' size={15} />
                          </span>{' '}
                          {item.note}
                        </span>
                      )}
                    </div>

                    <div className='flex flex-col items-end justify-center'>
                      <p className='text-md font-semibold text-[0.8rem] text-primary'>
                        Thành tiền: {formatCurrencyDecimalVND(item.price * item.quantity)} VNĐ
                      </p>
                      {!isHistory &&
                        request.status !== RequestStatus.INPROGRESS &&
                        request?.status !== RequestStatus.REJECTED &&
                        request?.status !== RequestStatus.CANCELED && (
                          <div className='flex items-center justify-center gap-4'>
                            <BaseButton
                              size='small'
                              icon={<FaMinus />}
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              shape='circle'
                              disabled={item.quantity <= 1}
                              override={theme.primaryWithAlpha}
                              textColor={theme.primary}
                            />
                            <span className='text-lg font-medium text-primary'>{item.quantity}</span>
                            <BaseButton
                              size='small'
                              icon={<FaPlus />}
                              shape='circle'
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={
                                item.quantity >=
                                (request?.requestProducts.find((p) => p.productId === item.productId)?.quantity || 0)
                              }
                            />
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {request.type === RequestType.STAFF && (
              <div>
                <h2 className='font-medium mb-2'>Vấn đề</h2>
                <div className='flex flex-wrap gap-2'>
                  {request?.problems?.map((problem, index) => (
                    <span key={index} className='px-3 py-1 bg-lightBlue text-primary font-medium rounded-full text-sm'>
                      {problem}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Tổng tiền  */}
      {request?.type === RequestType.ORDER && (
        <div className='px-4 py-2'>
          <span className='float-right text-primary font-medium'>
            Tổng tiền: <span className='font-bold'>{formatCurrencyDecimalVND(totalAmount)} VNĐ</span>
          </span>
        </div>
      )}
      <div className='flex flex-col justify-between flex-1'>
        {/* Ghi chú đơn */}
        {request?.note && request.note.trim() !== '' && (
          <div className='px-4 py-2'>
            <p className='text-sm font-semibold mb-1'>Ghi chú đơn</p>
            <BaseInput.TextArea
              placeholder='Không ghi chú'
              className='w-full p-2 border rounded'
              autoSize={{ minRows: 3, maxRows: 5 }}
              value={request?.note || ''}
              readOnly
            />
          </div>
        )}
        {!isHistory && (
          <div className='px-4 py-3 flex gap-2 justify-center mt-auto'>
            {request?.type === RequestType.ORDER &&
              request?.status !== RequestStatus.INPROGRESS &&
              request?.status !== RequestStatus.REJECTED &&
              request?.status !== RequestStatus.CANCELED && (
                <BaseButton
                  type='primary'
                  className='px-10 w-full bg-red-600 hover:!bg-red-500 active:!bg-red-500'
                  onClick={handleOpenModalReject}
                >
                  Từ chối
                </BaseButton>
              )}
            {request?.type === RequestType.ORDER &&
              request?.status !== RequestStatus.INPROGRESS &&
              request?.status !== RequestStatus.REJECTED &&
              request?.status !== RequestStatus.CANCELED && (
                <BaseButton
                  type='primary'
                  className='px-10 w-full'
                  onClick={handleSave}
                  disabled={products.length === 0}
                >
                  {currentUser?.currentUserStore?.store?.kitchenDisabled ? 'Xác nhận' : 'Chuyển bếp'}
                </BaseButton>
              )}
            {request?.type === RequestType.STAFF && (
              <BaseButton type='primary' onClick={handleConfirm}>
                Xác nhận
              </BaseButton>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={() => {
          setSelectedItems([]);
          onClose();
        }}
        width={500}
        closable={false}
        maskClosable={true}
        placement='right'
        bodyStyle={{ padding: 0, overflowY: 'hidden', height: '100%' }}
        contentWrapperStyle={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
        style={{ position: 'absolute' }}
      >
        {drawerContent}
      </Drawer>

      <ModalRejectRequest
        isOpen={isOpenModalCancel}
        onClose={() => SetIsOpenModalCancel(false)}
        onConfirm={handleReject}
        icon={<BiDish size={30} />}
      />
    </>
  );
};

export default RequestDrawer;
