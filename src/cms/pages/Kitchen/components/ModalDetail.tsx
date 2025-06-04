import dayjs from 'dayjs';
import React from 'react';
import CustomModal from 'src/shared/components/Modals/Modal';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import { RequestProduct } from 'src/types/request.type';
interface ModalTableOrderProps {
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
  loading?: boolean;
  detail?: RequestProduct;
  confirmLabel?: string;
}
const ModalDetail: React.FC<ModalTableOrderProps> = ({ detail, isOpen, onClose, onConfirm, confirmLabel }) => {
  return (
    <CustomModal
      confirmLabel={confirmLabel}
      isOpen={isOpen}
      title={'Chi tiết món'}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={false}
      showCancel={false}
      width={500}
      textColorIcon='#005FAB'
    >
      <div className='w-full h-full max-h-[50vh] md:max-h-[60vh] overflow-y-auto'>
        <div className='flex justify-between'>
          <h2 className=''>
            {detail?.request?.table?.name} - {detail?.request?.table?.zone?.name} -{' '}
            {capitalizeFirstLetter(dayjs(detail?.request.confirmedAt).fromNow()).replace('tới', 'trước')}
          </h2>
          <h2>{detail?.request?.sessionCustomer?.customer?.name}</h2>
        </div>
        <div className='flex justify-between my-2 text-primary'>
          <h2 className='text-[16px] font-semibold'>{detail?.productName}</h2>
          <h2 className='font-normal'>x{detail?.quantity}</h2>
        </div>
        <div className='flex justify-between text-primary'>
          <h2>
            SL đã thực hiện : <span className='font-semibold'>{detail?.completedQuantity}</span>
          </h2>
          <h2>
            SL đã phục vụ : <span className='font-semibold'>{detail?.servedQuantity}</span>
          </h2>
        </div>
        {detail?.note && (
          <div className='mt-4'>
            <h2 className='font-semibold text-[16px]'>Ghi chú món</h2>
            <h2 className='p-2 border rounded-xl mt-1 bg-[#F9F9F9]'>{detail?.note}</h2>
          </div>
        )}
        {detail?.requestProductHistories?.map((item) => (
          <>
            <h2 className='mt-4 font-semibold text-[16px]'>
              Nhân viên yêu cầu làm lại: <span className='text-black font-normal text-[14px]'>{item?.user?.name}</span>
            </h2>
            <div className='mt-2'>
              <h2 className='font-semibold text-[16px]'>Lý do làm lại</h2>
              <h2 className='p-2 border rounded-xl mt-1 bg-[#F9F9F9]'>{item?.reason}</h2>
            </div>
          </>
        ))}
      </div>
    </CustomModal>
  );
};
export default ModalDetail;
