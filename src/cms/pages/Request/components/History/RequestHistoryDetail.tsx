import { Tag } from 'antd';
import { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { RequestStatus, RequestType } from 'src/shared/common/enum';
import OverlayLoader from 'src/shared/components/Loading/OverlayLoader';
import useRequestStore from 'src/store/useRequestStore';
import { RequestProduct } from 'src/types/request.type';
import { CheckOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { IoWarningOutline } from 'react-icons/io5';
import { RequestStatusBadge } from 'src/cms/components/Badge/RequestStatusBadge';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
export default function RequestHistoryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { prevFilters, prevPagination, historyFilters, historyPagination } = location.state || {};
  const { getRequestDetail, detailRequest, isLoading } = useRequestStore();
  const [products, setProducts] = useState<RequestProduct[]>([]);

  useEffect(() => {
    if (id) {
      getRequestDetail(id);
    }
  }, [id]);
  useEffect(() => {
    if (detailRequest?.requestProducts) {
      setProducts(detailRequest.requestProducts);
    }
  }, [id && detailRequest]);
  const handleBack = () => {
    const searchParams = new URLSearchParams();
    if (historyFilters) {
      Object.entries(historyFilters).forEach(([key, value]) => {
        if (value) searchParams.set(key, value.toString());
      });
    }
    if (historyPagination) {
      searchParams.set('page', historyPagination.current.toString());
      searchParams.set('limit', historyPagination.pageSize.toString());
    }
    // navigate(`/request/history?${searchParams.toString()}`, {
    //   state: {
    //     prevFilters,
    //     prevPagination
    //   }
    // });
    navigate(-1);
  };
  if (isLoading || !detailRequest) {
    return <OverlayLoader spinning={true} children={null} />;
  }
  const totalAmount = products.reduce((total, product) => total + product.price * product.quantity, 0);
  return (
    <DetailHeader
      title={
        detailRequest.type === RequestType.STAFF
          ? 'Lịch sử yêu cầu nhân viên'
          : detailRequest.type === RequestType.PAYMENT
            ? 'Lịch sử yêu cầu thanh toán'
            : 'Lịch sử yêu cầu gọi món'
      }
      handleBack={handleBack}
      rightElement={RequestStatusBadge(detailRequest.status)}
    >
      {/* <div className='my-3 flex sm:justify-start md:justify-end'>
        {RequestStatusBadge(detailRequest.status)}
      </div> */}
      {(detailRequest.status === RequestStatus.REJECTED || detailRequest.status === RequestStatus.CANCELED) && (
        <div className='my-3 w-full flex sm:justify-start md:justify-start'>
          <p className='text-sm text-orange-500 flex items-center gap-1'>
            {' '}
            <IoWarningOutline />
            {detailRequest.status === RequestStatus.REJECTED
              ? 'Nhân viên đã từ chối yêu cầu này'
              : 'Khách hàng đã hủy yêu cầu này'}
          </p>
        </div>
      )}
      {detailRequest.type === RequestType.STAFF ? (
        <div>
          <div className='bg-white rounded-md p-6 shadow-sm'>
            <div className='flex flex-col sm:flex-row gap-2 mb-2'>
              <div className='sm:w-[50%] flex gap-1'>
                <span className='block sm:inline flex font-medium'>Khu vực: </span>
                {detailRequest?.table?.zone?.name || 'Không rõ'}
              </div>
              <div className='sm:w-[50%] flex gap-1'>
                <span className='block sm:inline font-medium'>Bàn:</span> {detailRequest?.table?.name || 'Không rõ'}
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-2 mb-2'>
              <div className='sm:w-[50%] flex gap-1 flex-wrap'>
                <span className='block sm:inline font-medium'>Khách hàng:</span>{' '}
                {detailRequest?.sessionCustomer?.customer?.name || 'Không rõ'}
              </div>
              <div className='sm:w-[50%] flex gap-1'>
                <span className='flex gap-1 flex-wrap'>
                  <span className='block sm:inline font-medium'>Thời gian gửi yêu cầu:</span>{' '}
                  {detailRequest?.createdAt ? new Date(detailRequest.createdAt).toLocaleString() : 'Không rõ'}
                </span>
              </div>
            </div>
            {detailRequest.status !== RequestStatus.CANCELED && (
              <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                <div className='sm:w-[50%] flex gap-1'>
                  <span className='block sm:inline'>
                    <span className='font-medium'>Nhân viên:</span> {detailRequest?.user?.name || 'Không rõ'}
                  </span>
                </div>
                <div className='sm:w-[50%] flex gap-1'>
                  <span className='flex gap-1 flex-wrap'>
                    <span className='block sm:inline font-medium'>Thời gian phản hồi: </span>
                    {detailRequest?.updatedAt ? new Date(detailRequest.updatedAt).toLocaleString() : 'Không rõ'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className='my-4'>
            <h2 className='font-medium mb-2'>Vấn đề</h2>
            <div className='flex flex-wrap gap-2'>
              {detailRequest?.problems?.map((problem, index) => (
                <span key={index} className='px-3 py-1 bg-lightBlue text-primary font-medium rounded-full text-sm'>
                  {problem}
                </span>
              ))}
            </div>
          </div>
          {detailRequest?.note && detailRequest?.note.trim() !== '' && (
            <div className='mb-4'>
              <h2 className='font-medium mb-2'>Ghi chú</h2>
              <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
            </div>
          )}
          {/* <div className='mb-4'>
            <h2 className='font-medium mb-2'>Ghi chú</h2>
            <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
          </div> */}
          {detailRequest.status === RequestStatus.REJECTED && (
            <div className='flex flex-col '>
              <span className='font-medium'>Lý do hủy đơn</span>
              <div className='text-wrap whitespace-pre-line'>{detailRequest?.rejectReason || ''}</div>
            </div>
          )}
        </div>
      ) : detailRequest.type === RequestType.ORDER ? (
        <div>
          <div className='bg-white shadow-sm p-6 rounded-md'>
            <div className='flex flex-col sm:flex-row gap-2'>
              <div className='sm:w-[50%]'>
                <span className='block sm:inline'>
                  <span className='font-medium'>Khu vực:</span> {detailRequest?.table?.zone?.name || 'Không rõ'}
                </span>
              </div>
              <div>
                <span className='block sm:inline'>
                  <span className='font-medium'>Bàn:</span> {detailRequest?.table?.name || 'Không rõ'}
                </span>
              </div>
            </div>
            <div className='flex flex-col sm:flex-row  gap-2 my-2'>
              <div className='sm:w-[50%]'>
                <span className='flex gap-1 flex-wrap'>
                  <span className='font-medium'>Khách hàng:</span>{' '}
                  {detailRequest?.sessionCustomer?.customer?.name || 'Không rõ'}
                </span>
              </div>
              <div>
                <span className='flex gap-1 flex-wrap'>
                  <span className='font-medium'>Thời gian gửi yêu cầu:</span>{' '}
                  {detailRequest?.createdAt ? new Date(detailRequest.createdAt).toLocaleString() : 'Không rõ'}
                </span>
              </div>
            </div>
            {detailRequest.status !== RequestStatus.CANCELED && (
              <div className='flex flex-col sm:flex-row gap-2 my-2'>
                <div className='sm:w-[50%]'>
                  <span className='flex gap-1 flex-wrap'>
                    <span className='font-medium'>Nhân viên:</span> {detailRequest?.user?.name || 'Không rõ'}
                  </span>
                </div>
                <span className='flex gap-1 flex-wrap'>
                  <span className='font-medium'>Thời gian gửi phản hồi: </span>
                  {detailRequest?.updatedAt ? new Date(detailRequest.updatedAt).toLocaleString() : 'Không rõ'}
                </span>
              </div>
            )}

            <div className='w-full text-primary flex justify-end font-bold text-lg my-2'>
              <span>Tổng tiền: {formatCurrencyDecimalVND(totalAmount)} VNĐ</span>
            </div>
          </div>
          {products.map((item) => (
            <div
              key={item.productId}
              className='bg-white rounded-md py-4 px-6 mb-4 shadow-md flex flex-col sm:flex-row  gap-4 mt-5'
            >
              <div className='flex-1 flex flex-col items-start text-left justify-between'>
                <span className='font-bold'>
                  {item.productName} <span className='text-gray-500 font-medium'>(x{item.quantity})</span>
                </span>
                {item?.note && item.note.trim() !== '' && (
                  <span className='text-gray-500 flex gap-1 items-center'>
                    <FaEdit /> {item.note}
                  </span>
                )}

                <p className='flex flex-1 flex-wrap justify-start sm:justify-end flex-col gap-1 text-primary mt-2'>
                  <span>Số lượng gọi: {item.quantity}</span>
                  <span>Số lượng xác nhận: {item.servedQuantity}</span>
                </p>
              </div>

              {/* <div className='flex-shrink-0 flex items-center max-w-[300px] font-semibold'>{item.price.toLocaleString()} VNĐ</div> */}
              <div className='flex-shrink-0 flex items-center sm:justify-end w-[200px] font-semibold'>
                {formatCurrencyDecimalVND(item.price)} VNĐ
              </div>
            </div>
          ))}
          {detailRequest?.note && detailRequest?.note.trim() !== '' && (
            <div className='my-6 flex flex-col '>
              <span className='font-medium'>Ghi chú đơn</span>
              <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
            </div>
          )}
          {/* <div className='my-6 flex flex-col '>
            <span className='font-medium'>Ghi chú đơn</span>
            <div className='text-wrap whitespace-pre-line'>{detailRequest?.note || ''}</div>
          </div> */}
          {detailRequest.status === RequestStatus.REJECTED && (
            <div className='my-6 flex flex-col '>
              <span className='font-medium'>Lý do hủy đơn</span>
              <div className='text-wrap whitespace-pre-line'>{detailRequest?.rejectReason || ''}</div>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center p-4'>Loại yêu cầu không được hỗ trợ.</div>
      )}
    </DetailHeader>
  );
}
