import { Modal } from 'antd';
import { Table } from 'src/types/table.type';
import { PrinterOutlined } from '@ant-design/icons';
import { logoBlueSmall } from 'src/assets/images';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAuthStore from 'src/store/authStore';
import BaseButton from 'src/shared/components/Buttons/Button';
import { QRCodeSVG } from 'qrcode.react';
import { generateImageURL } from 'src/shared/utils/utils';

interface TableQrCodeToPrintProps {
  table: Table | null;
}
const TableQrCodeToPrint = ({ table }: TableQrCodeToPrintProps) => {
  const { currentUser } = useAuthStore();
  return (
    <div className='mx-[10px] my-2 border border-primary border-dashed rounded-lg py-2 text-center'>
      <p className='text-primary text-xs mb-1 font-semibold line-clamp-2' style={{ fontSize: '10px' }}>
        {`${table?.name} - ${table?.zone.name}` || ''}
      </p>
      <div className='flex justify-center'>
        <QRCodeSVG level='M' value={`${window.location.origin}/welcome?tableId=${table?.id}`} size={95} type='svg' />
      </div>
      <p className='text-xs mt-1 uppercase font-semibold' style={{ fontSize: '8px' }}>
        Quét QR để gọi món
      </p>
    </div>
  );
};

export default TableQrCodeToPrint;
