import React from 'react';
import { IoMdNotificationsOutline } from 'react-icons/io';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import ChangeQuantityModal from './ChangeQuantityModal';

interface ExpandedDataType {
  key: React.Key;
  name: string;
  quantity: number;
  completedQuantity: number;
  servedQuantity: number;
  redoQuantity: number;
  productName: string;
  customerName: string;
}
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: ExpandedDataType[];
  dataTemp?: ExpandedDataType[];
  handleChangeValue: (index: number, value: number) => void;
  actionType: 'remade' | 'complete' | 'cancel' | 'serve';
  control?: any;
  errors?: any;
  loading?: boolean;
}

const ACTION_CONFIG = {
  remade: {
    label: 'yêu cầu làm lại',
    type: 'remade',
    confirmLabel: 'Làm lại món'
  },
  serve: {
    label: 'Phục vụ',
    type: 'primary',
    confirmLabel: 'Phục vụ'
  },
  complete: {
    label: 'đã chế biến',
    type: 'primary',
    confirmLabel: 'Đồng ý'
  },
  cancel: {
    label: 'hủy chế biến',
    type: 'danger',
    confirmLabel: 'Đồng ý'
  }
};

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  dataTemp,
  actionType,
  handleChangeValue,
  control,
  errors,
  loading
}: ModalProps) {
  const { label, type, confirmLabel } = ACTION_CONFIG[actionType];
  return (
    <ChangeQuantityModal
      isOpen={isOpen}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      type={type}
      icon={<IoMdNotificationsOutline className='text-[26px] text-successGreen' />}
      showCancel={true}
      confirmLabel={confirmLabel}
      className='justify-space-between'
      isFromActionModal={true}
      data={data}
    >
      <div className='w-full'>
        <p className='text-center mb-2 text-[16px]'>
          {actionType === 'cancel' && <>Điều chỉnh số lượng món cần hủy chế biến:</>}
          {actionType === 'complete' && <>Điều chỉnh số lượng món đã chế biến:</>}
          {actionType === 'remade' && <>Điều chỉnh số lượng món cần làm lại:</>}
          {actionType === 'serve' && <>Điều chỉnh số lượng món cần phục vụ:</>}
        </p>
        <div
          className='shadow-md p-2 border rounded-lg  overflow-y-scroll'
          style={{
            maxHeight: '40vh'
          }}
        >
          <div className='flex justify-between'>
            <h2 className='text-black text-[14px]'>Tên món</h2>
            <h2 className='text-black text-[14px]'>Số lượng</h2>
          </div>
          {data?.map((item, index) => {
            const matchedItem = dataTemp?.find((tempItem) => tempItem.key === item.key);
            return (
              <div key={item?.key}>
                {actionType === 'remade' && (
                  <>
                    <div className='flex justify-between mt-3'>
                      <div className='flex flex-col gap-[2px]'>
                        <h2 className='text-darkGray text-[14px]'>{item?.name || item?.productName}</h2>
                        {item?.customerName && <h3 className='text-primary text-xs'>{item?.customerName}</h3>}
                      </div>
                      <QuantityInput
                        className='text-[16px]'
                        disabled={
                          (dataTemp?.[index]?.completedQuantity || 0) - (dataTemp?.[index]?.servedQuantity || 0) ===
                          (item?.completedQuantity || 0) - (item?.servedQuantity || 0)
                        }
                        value={(item?.completedQuantity || 0) - (item?.servedQuantity || 0)}
                        onChange={(value) => handleChangeValue(index, value)}
                      />
                    </div>
                    <div className='mt-4'>
                      <Label
                        text='Lý do cần làm lại'
                        validate={true}
                        className='font-normal text-mediumGray text-[14px]'
                      />
                      <FormInput
                        control={control}
                        name={`reasons[${index}]`}
                        type='textarea'
                        disabled={false}
                        placeholder='Nhập nội dung'
                        errors={errors?.reasons?.[index]}
                        size='large'
                        className='text-[14px]'
                      />
                    </div>
                  </>
                )}
                {actionType === 'serve' && (
                  <>
                    <div className='flex justify-between mt-3'>
                      <div className='flex flex-col gap-[2px]'>
                        <h2 className='text-darkGray text-[14px]'>{item?.name || item?.productName}</h2>
                        {item?.customerName && <h3 className='text-primary text-xs'>{item?.customerName}</h3>}
                      </div>
                      <QuantityInput
                        className='text-[16px]'
                        disabled={
                          (dataTemp?.[index]?.completedQuantity || 0) - (dataTemp?.[index]?.servedQuantity || 0) ===
                          (item?.completedQuantity || 0) - (item?.servedQuantity || 0)
                        }
                        value={(item?.completedQuantity || 0) - (item?.servedQuantity || 0)}
                        onChange={(value) => handleChangeValue(index, value)}
                      />
                    </div>
                  </>
                )}
                {actionType === 'cancel' && (
                  <div className='flex justify-between mt-3'>
                    <div className='flex flex-col gap-[2px]'>
                      <h2 className='text-darkGray text-[14px]'>{item.name || item?.productName}</h2>
                      {item?.customerName && <h3 className='text-primary text-xs'>{item?.customerName}</h3>}
                    </div>
                    <QuantityInput
                      className='text-[16px]'
                      disabled={
                        (item?.quantity || 0) - (item?.completedQuantity || 0) >=
                        (matchedItem?.quantity || 0) - (matchedItem?.completedQuantity || 0)
                      }
                      value={(item?.quantity || 0) - (item?.completedQuantity || 0)}
                      onChange={(value) => handleChangeValue(index, value)}
                    />
                  </div>
                )}
                {actionType === 'complete' && (
                  <div className='flex justify-between mt-3'>
                    <div className='flex flex-col gap-[2px]'>
                      <h2 className='text-darkGray text-[14px]'>{item?.name || item?.productName}</h2>
                      {item?.customerName && <h3 className='text-primary text-xs'>{item?.customerName}</h3>}
                    </div>
                    <QuantityInput
                      className='text-[16px]'
                      disabled={
                        (item?.quantity || 0) - (item?.completedQuantity || 0) >=
                        (matchedItem?.quantity || 0) - (matchedItem?.completedQuantity || 0)
                      }
                      value={(item?.quantity || 0) - (item?.completedQuantity || 0)}
                      onChange={(value) => handleChangeValue(index, value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <h2 className='text-center mt-3 font-light'>
          Xác nhận <span className='font-medium'>{label.toLowerCase()}</span> các món trên?
        </h2>
      </div>
    </ChangeQuantityModal>
  );
}
