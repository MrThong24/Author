import React, { useEffect, useState } from 'react';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import BaseButton from 'src/shared/components/Buttons/Button';
import { FaPlus } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import useRequestStore from 'src/store/useRequestStore';
import { RequestProduct } from 'src/types/request.type';
import { RequestStatus } from 'src/shared/common/enum';
import { FaEdit } from 'react-icons/fa';
import { BiDish } from 'react-icons/bi';
import ModalRejectRequest from './ModalRejectRequest/ModalRejectRequest';
interface ListOrderProps {
  setHasUnsavedChanges: (value: boolean) => void;
}
const ListOrder: React.FC<ListOrderProps> = ({ setHasUnsavedChanges }) => {
  const { id } = useParams();
  const { detailRequest, confirmOrRejectRequest } = useRequestStore();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [products, setProducts] = useState<RequestProduct[]>([]);
  const [isOpenModalCancel, SetIsOpenModalCancel] = useState(false);
  useEffect(() => {
    if (detailRequest?.requestProducts) {
      setProducts(detailRequest.requestProducts);
    }
  }, [id]);

  useEffect(() => {
    const hasChanges = JSON.stringify(products) !== JSON.stringify(detailRequest?.requestProducts);
    setHasUnsavedChanges(hasChanges);
  }, [products, detailRequest?.requestProducts, setHasUnsavedChanges]);

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

  const handleSave = async () => {
    if (!id) return;
    try {
      const updatedProducts = products.map(({ productId, ...rest }) => ({
        ...rest,
        productId: productId,
        id: productId
      }));
      await confirmOrRejectRequest(id, {
        status: RequestStatus.INPROGRESS,
        requestProducts: updatedProducts,
        rejectReason: ''
      });
      navigate(-1);
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu:', error);
    }
  };

  const handleOpenModalReject = () => {
    SetIsOpenModalCancel(true);
  };

  const handleReject = async (reason: string) => {
    if (!id) return;

    try {
      await confirmOrRejectRequest(id, {
        status: RequestStatus.REJECTED,
        rejectReason: reason
      });
      navigate(-1);
    } catch (error) {
      console.error('Lỗi khi hủy yêu cầu:', error);
    }
  };

  const totalAmount = products.reduce((total, product) => total + product.price * product.quantity, 0);

  return (
    <div>
      <div className='flex flex-col sm:flex-row  gap-2'>
        <div className='w-[50%]'>
          <span className='block sm:inline'>
            <span className='font-medium'>Khu vực:</span> {detailRequest?.table?.zone?.name || 'Không rõ'}
          </span>
        </div>
        <div>
          <span className='block sm:inline'>
            <span className='font-medium'>Bàn:</span> {detailRequest?.table?.name || 'Không rõ'}
          </span>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row  gap-2 my-2'>
        <div className='w-[50%]'>
          <span className='block sm:inline'>
            <span className='font-medium'>Khách hàng:</span>{' '}
            {detailRequest?.sessionCustomer?.customer?.name || 'Không rõ'}
          </span>
        </div>
        <div>
          <span className='block sm:inline'>
            <span className='font-medium'>Thời gian gửi yêu cầu:</span>{' '}
            {detailRequest?.createdAt ? new Date(detailRequest.createdAt).toLocaleString() : 'Không rõ'}
          </span>
        </div>
      </div>
      <div className='w-full text-primary flex justify-end font-bold text-xl my-2'>
        <span>Tổng tiền: {totalAmount.toLocaleString()} VNĐ</span>
      </div>
      <div className='flex justify-end mb-3'>
        <BaseButton
          icon={<FaRegTrashAlt />}
          disabled={!selectedItems.length}
          color='danger'
          onClick={handleDeleteSelected}
        >
          Xoá
        </BaseButton>
      </div>

      {products.map((item) => (
        <div
          key={item.productId}
          className='bg-white rounded-md py-4 px-6 mb-4 shadow-md flex flex-col sm:flex-row  gap-4 mt-5'
        >
          <div className='flex items-center'>
            <BaseCheckbox
              checked={selectedItems.includes(item.productId)}
              onChange={(e) => handleCheckboxChange(item.productId, e.target.checked)}
            />
          </div>

          <div className='flex-1 flex flex-col  items-start  text-left'>
            <span className='font-bold'>
              {item.productName} <span className='text-gray-500 font-medium'>(x{item.quantity})</span>
            </span>
            {/* <span className='text-gray-500 flex gap-1 items-center'>
              <FaEdit /> {item.note || 'Không ghi chú'}
            </span> */}
            {item.note && item.note.trim() !== '' && (
              <span className='text-gray-500 flex gap-1 items-center'>
                <FaEdit /> {item.note}
              </span>
            )}
          </div>

          <div className='flex-shrink-0 flex items-center justify-center text-center font-semibold'>
            {item.price.toLocaleString()} VNĐ
          </div>

          <div className='flex items-center justify-center gap-2'>
            <BaseButton
              size='small'
              icon={<FaMinus />}
              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
              shape='circle'
              disabled={item.quantity <= 1}
            />
            <span className='text-lg font-medium'>{item.quantity}</span>
            <BaseButton
              size='small'
              icon={<FaPlus />}
              shape='circle'
              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
              disabled={
                item.quantity >=
                (detailRequest?.requestProducts.find((p) => p.productId === item.productId)?.quantity || 0)
              }
            />
          </div>
        </div>
      ))}

      <div className='my-6 flex flex-col '>
        <span className='font-medium'>Ghi chú đơn</span>
        <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
      </div>

      <div className='flex justify-center gap-x-4 '>
        <BaseButton color='danger' className='w-[120px]' onClick={handleOpenModalReject}>
          Từ chối
        </BaseButton>
        <BaseButton onClick={handleSave}>Xác nhận và chuyển bếp</BaseButton>
      </div>
      <ModalRejectRequest
        isOpen={isOpenModalCancel}
        onClose={() => SetIsOpenModalCancel(false)}
        onConfirm={handleReject}
        icon={<BiDish size={30} />}
      />
    </div>
  );
};

export default ListOrder;
