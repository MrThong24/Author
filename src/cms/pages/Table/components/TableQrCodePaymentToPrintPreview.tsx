import { Modal } from 'antd';
import { Table, TableToPrint } from 'src/types/table.type';
import { PrinterOutlined } from '@ant-design/icons';
import { posLogo, logoBlueSmall } from 'src/assets/images';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAuthStore from 'src/store/authStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import { QRCodeSVG } from 'qrcode.react';
import { generateImageURL } from 'src/shared/utils/utils';
import { MOBIFONE_LOGO } from 'src/shared/common/icon';

interface TableQrCodePaymentToPrintPreviewProps {
  tableToPrint: TableToPrint | null;
}
const TableQrCodePaymentToPrintPreview = ({ tableToPrint }: TableQrCodePaymentToPrintPreviewProps) => {
  const { currentUser } = useAuthStore();
  return (
    <div className='w-fit p-1'>
      <div className='flex items-center gap-x-4 mb-1'>
        <div className='flex flex-col items-center p-1'>
          <p className='mb-[2px] font-semibold text-[10px] sm:text-xs' style={{ marginTop: '-2px' }}>
            QUÉT ĐỂ GỌI MÓN
          </p>
          <div className='p-[2px]'>
            <QRCodeSVG
              className='w-full h-full max-w-[100px] max-h-[100px] '
              level='M'
              value={tableToPrint?.qrCodeOrder || ''}
              type='svg'
            />
          </div>
        </div>
        <div className='text-center'>
          <p
            className='font-semibold text-xs sm:text-sm line-clamp-3 w-[100px] pb-1 border-b border-black mb-1'
            style={{ lineHeight: '14px' }}
          >
            {`${tableToPrint?.tableName || ''} - ${tableToPrint?.zoneName || ''}`}
          </p>
          <div className='flex justify-center mt-2'>
            <img src={posLogo} alt='' className='w-[70px] h-auto' />
          </div>
          {/* <p className='font-semibold text-sm line-clamp-2 w-[70px]' style={{ fontSize: '14px', lineHeight: '14px' }}>
            {tableToPrint?.zoneName || 'Khu vực 1'}
          </p> */}
        </div>
        <div className='flex flex-col items-center p-1'>
          <p className='mb-[2px] font-semibold text-[10px] sm:text-xs' style={{ marginTop: '-2px' }}>
            QUÉT ĐỂ THANH TOÁN
          </p>
          <div className='p-[2px]'>
            <QRCodeSVG
              className='w-full h-full max-w-[100px] max-h-[100px]'
              level='M'
              value={tableToPrint?.qrCodePayment || ''}
              type='svg'
            />
          </div>
        </div>
      </div>
      <div className='flex justify-between items-center border-t border-black pt-[2px] font-semibold text-[10px] sm:text-xs'>
        <p>https://1pos.vn</p>
        <MOBIFONE_LOGO />
      </div>
    </div>
  );
};

export default TableQrCodePaymentToPrintPreview;
