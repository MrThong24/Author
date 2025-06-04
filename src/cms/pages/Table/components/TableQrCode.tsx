import { Modal, Radio, Space, Spin } from 'antd';
import { Table, TableToPrint } from 'src/types/table.type';
import { PrinterOutlined } from '@ant-design/icons';
import { bpacLogo, logoBlueSmall } from 'src/assets/images';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAuthStore from 'src/store/authStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from 'src/provider/ThemeContext';
import { generateImageURL } from 'src/shared/utils/utils';
import { RadioChangeEvent } from 'antd/lib';
import TableQrCodePaymentToPrint from './TableQrCodePaymentToPrint';
import useTableStore from 'src/store/useTableStore';
import TableQrCodePaymentToPrintPreview from './TableQrCodePaymentToPrintPreview';

interface TableQrCodeProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  handlePrint: () => void;
  handlePrintPayment: (id: string) => void;
  isBpacExtensionInstalled: boolean;
  handlePrintBpac: (ids?: string[]) => void;
}
const TableQrCode = ({
  table,
  isOpen,
  onClose,
  handlePrint,
  handlePrintPayment,
  isBpacExtensionInstalled,
  handlePrintBpac
}: TableQrCodeProps) => {
  const { currentUser } = useAuthStore();
  const { isLoading, getTableDataToPrint } = useTableStore();
  const [dataToPrint, setDataToPrint] = useState<TableToPrint[]>([]);
  const [typeQr, setTypeQr] = useState<'qr' | 'qrPayment'>('qr');
  const qrOptions = [
    {
      value: 'qr',
      label: 'QR bàn',
      icon: <PrinterOutlined className='text-primary text-[20px] font-bold' />
    },
    {
      value: 'qrPayment',
      label: 'QR bàn và QR thanh toán',
      icon: <PrinterOutlined className='text-primary text-[20px] font-bold' />
    }
  ];

  const onChange = (e: RadioChangeEvent) => {
    setTypeQr(e.target.value);
  };

  const handleGetTableDataToPrint = async (id: string) => {
    const dataToPrint = await getTableDataToPrint([id], window.location.origin);
    setDataToPrint(dataToPrint);
  };

  useEffect(() => {
    if (typeQr === 'qrPayment' && table?.id) {
      handleGetTableDataToPrint(table.id);
    }
  }, [typeQr]);

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        onClose();
        setTypeQr('qr');
        setDataToPrint([]);
      }}
      footer={null}
      width={500}
    >
      <div className='text-center'>
        <div className='border border-primary rounded-lg mt-8 py-2 mb-4 print-content text-center flex justify-center'>
          {typeQr === 'qr' ? (
            <div>
              <p className='text-primary text-base mb-2'>{table?.name || ''}</p>
              <div className='flex justify-center'>
                <QRCodeSVG
                  level='M'
                  value={`${window.location.origin}/welcome?tableId=${table?.id}`}
                  size={200}
                  type='svg'
                />
              </div>
              <p className='text-xs mt-2 font-semibold'>Quét mã QR này để gọi món</p>
            </div>
          ) : (
            <Spin spinning={isLoading}>
              <TableQrCodePaymentToPrintPreview tableToPrint={dataToPrint[0]} />
            </Spin>
          )}
        </div>
        <div className='w-full text-center'>
          <Radio.Group onChange={onChange} value={typeQr} className='w-full mb-2'>
            <Space direction='vertical' className='w-full'>
              {qrOptions.map((qrOption) => (
                <Radio
                  value={qrOption.value}
                  className={`w-full rounded-md text-base shadow-sm px-4 py-2 text-primary ${qrOption.value === typeQr ? 'bg-lightBlue' : ''}`}
                >
                  <div className='flex items-center gap-x-2 pl-2'>
                    {qrOption.icon}
                    <span>{qrOption.label}</span>
                  </div>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
          <div className='flex gap-x-4'>
            <BaseButton
              htmlType='submit'
              size='large'
              className='w-full mt-2'
              variant='filled'
              onClick={() => {
                typeQr === 'qr' ? handlePrint() : handlePrintPayment(table?.id || '');
              }}
            >
              In QR
            </BaseButton>
            {typeQr !== 'qr' && isBpacExtensionInstalled && (
              <BaseButton
                htmlType='submit'
                size='large'
                className='w-full mt-2'
                variant='filled'
                onClick={() => {
                  if (table) handlePrintBpac([table.id]);
                }}
              >
                <img src={bpacLogo} alt='' className='w-8' />
                In bằng b-PAC
              </BaseButton>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TableQrCode;
