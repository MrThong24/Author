import { FC, useMemo } from 'react';
import { generateImageURL } from 'src/shared/utils/utils';
import useAuthStore from 'src/store/authStore';
import { logoBlue } from 'src/assets/images';

interface TicketProps {
  data: any;
  type: 'request' | 'table' | 'all';
  printType: 'multi' | 'single';
  index?: number;
  tableName?: string;
}

const ProductItem: FC<{
  item: any;
  productName?: string;
  totalQuantity?: number;
}> = ({ item, productName, totalQuantity }) => {
  return (
    <div className='mb-2'>
      <div className='flex justify-between px-2'>
        <p className='text-[12px] text-start font-bold'>{item?.productName || item?.name || productName}</p>
        <p className='text-[12px] text-start font-bold'>{totalQuantity ?? item?.quantity}</p>
      </div>
      {item?.note && <p className='text-gray-600 text-start text-[12px] px-2'>Ghi chú: {item.note}</p>}
    </div>
  );
};

const TicketHeader: FC<{
  logoSrc: string;
  customerName?: string;
  tableName?: string;
  totalQuantity: number;
  note: string;
  index?: number;
}> = ({ logoSrc, customerName, tableName, totalQuantity, note, index }) => (
  <>
    <img src={logoSrc} alt='1POS Logo' className='mx-auto h-10 mb-1' />
    <h2 className='font-bold mb-4'>Phiếu chế biến</h2>
    <div className='flex justify-between px-2 mb-2'>
      <p className='text-gray-600 text-[12px]'>Khách hàng: {customerName || ''}</p>
      <p className='text-gray-600 text-[12px]'>Yêu cầu: {(index ?? 0) + 1}</p>
    </div>
    <div className='flex justify-between px-2 mb-2'>
      <p className='text-gray-600 text-[12px]'>Bàn: {tableName}</p>
      <p className='text-gray-600 text-[12px]'>Số lượng: {totalQuantity}</p>
    </div>
    {note && <p className='text-gray-600 text-start text-[12px] px-2 mb-2'>Ghi chú: {note}</p>}
    <div className='flex justify-between px-2 border-b border-primary border-dashed py-2'>
      <p className='text-[12px] font-bold'>Tên món</p>
      <p className='text-[12px] font-bold'>SL</p>
    </div>
  </>
);

const KitchenTickets: FC<TicketProps> = ({ data, type, printType, index, tableName }) => {
  const { currentUser } = useAuthStore();

  const logoSrc = useMemo(() => {
    return generateImageURL(currentUser?.currentUserStore?.store?.thumbnail) || logoBlue;
  }, [currentUser]);

  const note = useMemo(() => (type === 'table' ? data?.note || '' : ''), [data, type]);

  const customerName = useMemo(() => {
    if (type === 'table') {
      if (printType === 'multi') {
        return data?.sessionCustomer?.customer?.name || '';
      }
      return data?.customerName;
    }
    return '';
  }, [data, type, printType]);

  const totalQuantity = useMemo(() => {
    const sumQuantity = (items: any[]) => items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    if (type === 'request') {
      return printType === 'multi' ? sumQuantity(data) : data?.quantity || 0;
    }

    if (type === 'table') {
      return printType === 'multi' ? sumQuantity(data?.requestProducts) : sumQuantity(data?.list);
    }

    if (type === 'all') {
      if (printType === 'multi') {
        return sumQuantity(data?.flatMap((group) => group?.requestProducts || []));
      } else {
        return sumQuantity(data?.expandDataSourceList?.flat() || data?.requestProducts || []);
      }
    }

    return 0;
  }, [data, type, printType]);

  const renderProducts = () => {
    if (type === 'request') {
      return printType === 'multi' ? (
        data?.map((item: any) => <ProductItem key={item?.id} item={item} />)
      ) : (
        <ProductItem key={data?.id || 'single'} item={data} />
      );
    }

    if (type === 'table') {
      const list = printType === 'multi' ? data?.requestProducts : data?.list;
      return list?.map((item: any) => <ProductItem key={item?.id || item?.key} item={item} />);
    }

    if (type === 'all') {
      if (printType === 'multi') {
        return data?.map((request: any) => (
          <ProductItem
            key={request?.id}
            item={request?.requestProducts[0]}
            productName={request?.productName}
            totalQuantity={request?.requestProducts.reduce((sum, item) => sum + item.quantity, 0)}
          />
        ));
      }

      const flatList = data?.expandDataSourceList?.flat() || data?.requestProducts || [];
      return flatList.length > 0 ? (
        <ProductItem item={flatList[0]} totalQuantity={totalQuantity} productName={data?.productName || ''} />
      ) : null;
    }

    return null;
  };
  return (
    <div className='w-full bg-white'>
      <div className='text-center mb-3'>
        <TicketHeader
          logoSrc={logoSrc}
          totalQuantity={totalQuantity}
          customerName={customerName}
          note={note}
          index={index}
          tableName={tableName}
        />
        <div className='border-b border-primary border-dashed py-2'>{renderProducts()}</div>
        <p className='text-center text-[10px] mt-2'>
          <strong>Cung cấp bởi Mobifone</strong>
        </p>
      </div>
    </div>
  );
};

export default KitchenTickets;
