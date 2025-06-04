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

interface TableQrCodePaymentToPrintProps {
  tableToPrint: TableToPrint | null;
}
const TableQrCodePaymentToPrint = ({ tableToPrint }: TableQrCodePaymentToPrintProps) => {
  const { currentUser } = useAuthStore();
  return (
    <div className='w-fit p-1'>
      <div className='flex items-center gap-x-6 mb-1'>
        <div className='flex flex-col items-center p-1'>
          <p className='mb-[2px] font-semibold' style={{ fontSize: '8px', marginTop: '-2px' }}>
            QUÉT ĐỂ GỌI MÓN
          </p>
          <div className='p-[2px]'>
            <QRCodeSVG level='M' value={tableToPrint?.qrCodeOrder || ''} size={80} type='svg' />
          </div>
        </div>
        <div className='text-center'>
          <p
            className='font-semibold text-sm line-clamp-3 w-[100px] pb-1 border-b border-black mb-1'
            style={{ fontSize: '12px', lineHeight: '12px' }}
          >
            {`${tableToPrint?.tableName} - ${tableToPrint?.zoneName}`}
          </p>
          <div className='flex justify-center mt-2'>
            <img src={posLogo} alt='' className='w-[70px] h-auto' />
          </div>
          {/* <p className='font-semibold text-sm line-clamp-2 w-[70px]' style={{ fontSize: '12px', lineHeight: '14px' }}>
            {tableToPrint?.zoneName || 'Khu vực 1'}
          </p> */}
        </div>
        <div className='flex flex-col items-center p-1'>
          <p className='mb-[2px] font-semibold' style={{ fontSize: '8px', marginTop: '-2px' }}>
            QUÉT ĐỂ THANH TOÁN
          </p>
          <div className='p-[2px]'>
            <QRCodeSVG level='M' value={tableToPrint?.qrCodePayment || ''} size={80} type='svg' />
          </div>
        </div>
      </div>
      <div style={{ fontSize: '10px' }}>
        <div className='flex justify-between items-center border-t border-black pt-[2px] font-semibold'>
          <p>https://1pos.vn</p>
          <MOBIFONE_LOGO />
        </div>
      </div>
    </div>
  );
};

export default TableQrCodePaymentToPrint;
