import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRequestStore from 'src/store/useRequestStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import { RequestStatus } from 'src/shared/common/enum';
import { AiOutlineUser } from 'react-icons/ai';
import ModalRejectRequest from './ModalRejectRequest/ModalRejectRequest';

const RequestStaff: React.FC = () => {
  const { id } = useParams();
  const { detailRequest, confirmOrRejectRequest } = useRequestStore();
  const [isOpenModalCancel, SetIsOpenModalCancel] = useState(false);
  const navigate = useNavigate();


  const handleConfirm = async () => {
    if (!id) return;
    try {
      await confirmOrRejectRequest(id, {
        status: RequestStatus.CONFIRMED,
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

  return (
    <div>
      <div className='flex flex-col sm:flex-row gap-2 mb-4'>
        <div className='w-[50%]'>
          <span className='block sm:inline font-medium'>Khu vực:</span> {detailRequest?.table?.zone?.name || 'Không rõ'}
        </div>
        <div>
          <span className='block sm:inline font-medium'>Bàn:</span> {detailRequest?.table?.name || 'Không rõ'}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2 mb-4'>
        <div className='w-[50%]'>
          <span className='block sm:inline font-medium'>Khách hàng:</span>{' '}
          {detailRequest?.sessionCustomer?.customer?.name || 'Không rõ'}
        </div>
        <div>
          <span className='block sm:inline font-medium'>Thời gian gửi yêu cầu:</span>{' '}
          {detailRequest?.createdAt ? new Date(detailRequest.createdAt).toLocaleString() : 'Không rõ'}
        </div>
      </div>

      <div className='mb-4'>
        <h2 className='font-medium mb-2'>Vấn đề</h2>
        <div className='flex flex-wrap gap-2'>
          {detailRequest?.problems?.map((problem, index) => (
            <span key={index} className='px-3 py-1 bg-lightBlue text-primary font-medium rounded-full text-sm'>
              {problem}
            </span>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <h2 className='font-medium mb-2'>Ghi chú</h2>
        <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
      </div>

      <div className='flex justify-center gap-4'>
        <BaseButton color='danger' className='w-[120px]' onClick={handleOpenModalReject}>
          Từ chối
        </BaseButton>
        <BaseButton className='w-[120px]' onClick={handleConfirm}>
          Xác nhận
        </BaseButton>
      </div>
      <ModalRejectRequest
        isOpen={isOpenModalCancel}
        onClose={() => SetIsOpenModalCancel(false)}
        onConfirm={handleReject}
        icon={<AiOutlineUser className='text-primary' />}
      />
    </div>
  );
};

export default RequestStaff;
