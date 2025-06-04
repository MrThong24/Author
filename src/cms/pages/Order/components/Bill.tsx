import { QRCode } from 'antd';
import { logoBlue, logoBlueSmall } from 'src/assets/images';
import { formatCurrency, formatDate, formatTime, generateImageURL } from 'src/shared/utils/utils';
import useAuthStore from 'src/store/authStore';
import { Order } from 'src/types/order.type';
import useStoreStore from 'src/store/useStoreStore';
import { useEffect } from 'react';
import { OrderStatus } from 'src/shared/common/enum';

interface BillProps {
  qrCode: string | null;
  order: Order | null;
}

const Bill = ({ qrCode, order }: BillProps) => {
  const { currentUser } = useAuthStore();
  const { banks, getBanks } = useStoreStore();
  useEffect(() => {
    getBanks();
  }, []);
  return (
    <div className='w-full bg-white'>
      {/* Logo */}
      <div className='text-center mb-3'>
        <img
          src={generateImageURL(currentUser?.currentUserStore?.store?.thumbnail) || logoBlue}
          alt='1POS Logo'
          className='mx-auto h-10 mb-1'
        />
        <h2 className='font-bold'>{currentUser?.currentUserStore?.store?.name}</h2>
        <p className='text-gray-600 text-[12px] leading-tight'>
          Điện thoại: {currentUser?.currentUserStore?.store?.phone}
        </p>
        <p className='text-gray-600 text-[12px] leading-tight'>{currentUser?.currentUserStore?.store?.address}</p>
      </div>

      <div className='text-center mb-2'>
        <h1 className='text-[12px] font-bold uppercase'>
          {order?.status === OrderStatus.PAID ? 'Hóa đơn bán hàng' : 'Phiếu tạm tính'}
        </h1>
      </div>

      {/* Thông tin hóa đơn */}
      <div className='grid grid-cols-2 gap-x-4 mb-4 text-[12px]'>
        {/* Bên trái */}
        <div className='space-y-1'>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[65px]'>Số hóa đơn:</span>
            <span>{order?.code}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[65px]'>Khách hàng:</span>
            <span className='pl-1'>{order?.customerName}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[65px]'>Thu ngân:</span>
            <span>{currentUser?.name}</span>
          </p>
        </div>

        {/* Bên phải */}
        <div className='space-y-1'>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[46px]'>Ngày:</span>
            <span>{formatDate(order?.createdAt)}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[46px]'>Giờ vào:</span>
            <span>{formatTime(order?.session?.createdAt)}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[46px]'>Giờ ra:</span>
            <span>{formatTime(new Date())}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[46px]'>Bàn:</span>
            <span>{order?.table?.name}</span>
          </p>
          <p className='flex gap-x-2'>
            <span className='whitespace-nowrap min-w-[46px]'>Khách:</span>
            <span>{order?.session?.sessionCustomers?.length || 0}</span>
          </p>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className='border border-gray-300 rounded-lg mb-4'>
        <table className='w-full text-[10px] p-0'>
          <thead>
            <tr className='bg-gray-200'>
              <th className='p-1 text-left whitespace-nowrap'>Tên</th>
              <th className='p-1 text-left whitespace-nowrap'>SL</th>
              <th className='p-1 text-left whitespace-nowrap'>Đơn giá</th>
              <th className='p-1 text-right whitespace-nowrap'>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order?.products?.map((product) => (
              <tr>
                <td className='p-1'>{product?.productName}</td>
                <td className='p-1'>{product?.quantity}</td>
                <td className='p-1'>{formatCurrency(product?.price)}</td>
                <td className='p-1 text-right'>{formatCurrency(product?.price * product?.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng kết */}
      <div className='mb-4 text-[12px] text-center'>
        <p className='flex justify-between font-bold mb-2'>
          <span>{order?.discountAmount ? 'TỔNG THÀNH TIỀN' : 'TỔNG TIỀN THANH TOÁN'}</span>
          <span>{formatCurrency(order?.totalAmount)} VNĐ</span>
        </p>
        {!!order?.discountAmount && (
          <>
            <p className='flex justify-start text-start font-bold mb-2'>
              <span>
                Đã giảm ({formatCurrency(order?.discountAmount)} VNĐ) tương ứng 20% mức tỷ lệ % để tính thuế GTGT
              </span>
            </p>
            <p className='flex justify-between font-bold mb-2'>
              <span>TỔNG TIỀN THANH TOÁN</span>
              <span>{formatCurrency((order?.totalAmount || 0) - (order?.discountAmount || 0))} VNĐ</span>
            </p>
          </>
        )}
        <div className='flex justify-center mb-2'>
          <QRCode
            errorLevel='H'
            value={qrCode || ''}
            icon={generateImageURL(currentUser?.currentUserStore?.store?.thumbnail) || logoBlueSmall}
            size={200}
          />
        </div>
        <div className='font-bold'>
          <p>Ngân hàng: {banks.find((bank) => bank.bin === currentUser?.currentUserStore?.store?.bankBin)?.name}</p>
          <p>Chủ tài khoản: {currentUser?.currentUserStore?.store?.accountHolder} </p>
          <p>STK: {currentUser?.currentUserStore?.store?.bankNumber} </p>
        </div>
      </div>

      {/* Lời cảm ơn */}
      <div className='text-center mt-2'>
        <p className='text-[10px] font-bold'>CẢM ƠN QUÝ KHÁCH - HẸN GẶP LẠI</p>
      </div>
      <hr className='my-2' />
      <div className='text-center mt-2 text-[10px]'>
        <p className='font-bold'>Thông tin hóa đơn điện tử</p>
        <div>
          <span className=''>Số: </span>
          <span className='font-bold'>{order?.orderEInvoice?.eInvoiceNumber || ''}</span>
        </div>
        <div>
          <span className=''>Mã nhận hóa đơn: </span>
          <span className='font-bold'>{order?.orderEInvoice?.eInvoiceCode || ''}</span>
        </div>
        <div>
          <span className=''>Tra cứu tại: </span>
          <span className='font-bold'>http://tracuuhoadon.mobifoneinvoice.vn</span>
        </div>
      </div>
      <hr className='my-2' />
      <p className='text-center text-[10px]'>
        <strong>Cung cấp bởi Mobifone</strong>
      </p>
    </div>
  );
};

export default Bill;
