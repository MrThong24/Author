import CustomModal from 'src/shared/components/Modals/Modal';
import { Radio, Space } from 'antd';
import { PaymentMethod } from 'src/shared/common/enum';
import { RadioChangeEvent } from 'antd/lib';
import { BsCashCoin } from 'react-icons/bs';
import { BsQrCodeScan } from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';
import BaseButton from 'src/shared/components/Buttons/Button';

interface ModalPaymentProps {
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
  loading?: boolean;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onConfirmAndExportEInvoice?: () => void;
}

const ModalPayment: React.FC<ModalPaymentProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  paymentMethod,
  setPaymentMethod,
  onConfirmAndExportEInvoice
}) => {
  const paymentOptions = [
    {
      value: PaymentMethod.BANK_TRANSFER,
      label: 'Chuyển khoản',
      icon: <BsQrCodeScan />
    },
    {
      value: PaymentMethod.CASH,
      label: 'Tiền mặt',
      icon: <BsCashCoin />
    }
  ];
  const onChange = (e: RadioChangeEvent) => {
    setPaymentMethod(e.target.value);
  };
  return (
    <CustomModal
      isOpen={isOpen}
      title=''
      icon={
        <div className='bg-mintMist p-2 rounded-[50%]'>
          <div className='bg-lightGreen p-2 rounded-[50%]'>{<MdPayment />}</div>
        </div>
      }
      onClose={onClose}
      onConfirm={onConfirm}
      textColorIcon='#15803D'
      loading={loading}
      confirmLabel='Thanh toán'
      button={
        <BaseButton
          key='confirm'
          className={`text-lg font-semibold py-5 bg-primary`}
          color={'primary'}
          onClick={onConfirmAndExportEInvoice}
          loading={loading}
        >
          Thanh toán & xuất hóa đơn
        </BaseButton>
      }
    >
      <div className='w-full text-center'>
        <h1 className='font-semibold text-xl'>Chọn phương thức thanh toán</h1>
        <p className='text-[#535862] mb-6'>Vui lòng chọn phương thức thanh toán</p>
        <Radio.Group onChange={onChange} value={paymentMethod} className='w-full mb-2'>
          <Space direction='vertical' className='w-full'>
            {paymentOptions.map((paymentOption) => (
              <Radio
                value={paymentOption.value}
                className={`w-full rounded-md text-base shadow-sm px-4 py-2 text-primary ${paymentOption.value === paymentMethod ? 'bg-lightBlue' : ''}`}
              >
                <div className='flex items-center gap-x-2 pl-2'>
                  {paymentOption.icon}
                  <span>{paymentOption.label}</span>
                </div>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </CustomModal>
  );
};

export default ModalPayment;
