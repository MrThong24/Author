import { QRCode } from 'antd';
import { useState } from 'react';
import { CiBellOn } from 'react-icons/ci';
import { useParams } from 'react-router-dom';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { SocketEnum } from 'src/shared/common/enum';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import CustomModal from 'src/shared/components/Modals/Modal';
import { useMultiSocketEvents } from 'src/shared/utils/socket';

interface ModalBankTransferProps {
  onClose: () => void;
  onConfirm: () => void;
  onPaymentSuccess: () => void;
  isOpen: boolean;
  loading?: boolean;
  totalAmount: number;
  status: string | undefined;
  qrCode: string | null;
}

const ModalBankTransfer: React.FC<ModalBankTransferProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  totalAmount,
  qrCode,
  onPaymentSuccess
}) => {
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const { id } = useParams();
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.ORDER_PAID,
        callback: (orderId: string) => {
          if (id === orderId) onPaymentSuccess();
        }
      }
    ],
    []
  );
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        title=''
        icon={null}
        onClose={onClose}
        onConfirm={() => setOpenConfirmModal(true)}
        textColorIcon='#15803D'
        loading={loading}
      >
        <div className='w-full text-center'>
          <h1 className='font-semibold text-xl text-primary'>Thanh toán</h1>
          <p className='text-[#535862] mb-4'>Quét QR Code bên dưới để thanh toán</p>
          <div className='flex justify-center'>
            <QRCode errorLevel='H' value={qrCode || ''} size={260} />
          </div>
          <p className='text-primary mt-2'>
            <span className='font-semibold'>Số tiền thanh toán:</span> {formatCurrencyDecimalVND(totalAmount)} VNĐ
          </p>
        </div>
      </CustomModal>
      <ModalConfirm
        isOpen={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={() => {
          onConfirm();
          setOpenConfirmModal(false);
        }}
        loading={loading}
        icon={<CiBellOn />}
      >
        <p className='text-center'>Bạn có chắc là khách hàng đã thanh toán bằng chuyển khoản?</p>
      </ModalConfirm>
    </>
  );
};

export default ModalBankTransfer;
