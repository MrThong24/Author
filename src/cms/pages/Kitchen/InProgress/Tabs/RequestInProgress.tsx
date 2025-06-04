import { useEffect, useRef, useState } from 'react';
import { Empty, Skeleton, Table, TableColumnsType, Tooltip } from 'antd';
import { PiNotePencil } from 'react-icons/pi';
import BaseButton from 'src/shared/components/Buttons/Button';
import { IoClose } from 'react-icons/io5';
import { MdCheck } from 'react-icons/md';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { IoMdNotificationsOutline } from 'react-icons/io';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { HistoryRequest, RequestProduct } from 'src/types/request.type';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import ModalDetail from '../../components/ModalDetail';
import { getSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import { RoleType, SocketEnum } from 'src/shared/common/enum';
import { RequestTransferred } from 'src/types/requestTransferred.type';
import CardRequestProduct from '../../components/CardRequestProduct';
import useAuthStore from 'src/store/authStore';
import { useTheme } from 'src/provider/ThemeContext';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import ChangeQuantityModal from '../../components/ChangeQuantityModal';
import { AiOutlinePrinter } from 'react-icons/ai';
import { useReactToPrint } from 'react-to-print';
import KitchenTickets from '../components/KitchenTickets';

export default function RequestInProgress({ filters }: { filters: FilterKitchen }) {
  const { theme } = useTheme();
  const { requestsProductInProgress, setRequestProductInprogress, total, isLoading, updateCompleteOrCancel } =
    useRequestProductStore();
  const [modalDetail, setModalDetail] = useState<boolean>(false);
  const [modalCompleteOrCancel, setModalCompleteOrCancel] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'complete' | 'cancel' | null>(null);
  const [valueRow, setValueRow] = useState<RequestProduct>();
  const [valueChange, setValueChange] = useState<number>(0);
  const { currentUser } = useAuthStore();
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Bếp'
  });

  const columns: TableColumnsType<RequestProduct> = [
    {
      title: 'Món ăn',
      width: 350,
      align: 'left',
      render: (value: RequestProduct) => {
        const dataHistory = value?.requestProductHistories || [];
        return (
          <div className='flex flex-col gap-2 xl:items-start '>
            <div className='flex gap-2 flex-wrap text-left items-center'>
              <p className='font-semibold break-words text-[16px]'>{value.productName}</p>
              <span className='text-darkGreen text-[12px] font-normal px-2 rounded-[40px] py-[2px] bg-[#F0FDF4]'>
                {capitalizeFirstLetter(dayjs(value.request.confirmedAt).fromNow()).replace('tới', 'trước')}
              </span>
            </div>
            {value?.note && (
              <Tooltip title={value?.note} color={theme?.primary} trigger='hover'>
                <div
                  className='flex items-center gap-x-2 text-mediumGray cursor-pointer w-fit'
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalDetail(false);
                  }}
                >
                  <PiNotePencil size={18} className='text-[18px] min-w-[18px]' />
                  <h3 className='font-light line-clamp-1 '>{value?.note}</h3>
                </div>
              </Tooltip>
            )}
            {dataHistory && dataHistory?.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {dataHistory &&
                      dataHistory?.length > 0 &&
                      dataHistory.map((item: HistoryRequest, index: number) => (
                        <p key={item.id}>
                          Lý do làm lại (lần {(dataHistory?.length || 0) - index}) {item?.reason}
                        </p>
                      ))}
                  </div>
                }
                color={theme?.primary}
                trigger='hover'
              >
                <div
                  className='flex items-center gap-x-1 cursor-pointer w-fit'
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalDetail(false);
                  }}
                >
                  <PiNotePencil size={18} className='text-[18px] text-danger min-w-[18px]' />
                  <h3 className='font-light text-danger line-clamp-1'>Có yêu cầu làm lại</h3>
                </div>
              </Tooltip>
            )}
          </div>
        );
      }
    },
    {
      title: 'Bàn',
      width: 200,
      align: 'left',
      render: (value: RequestProduct) => (
        <div>{`${value?.request?.table?.name} - ${value?.request?.table?.zone?.name}`}</div>
      )
    },
    {
      title: 'Cần thực hiện',
      align: 'center',
      width: 100,
      render: (value: RequestProduct) => <div>{value?.quantity}</div>
    },
    {
      title: 'Đã thực hiện',
      align: 'center',
      width: 100,
      render: (value: RequestProduct) => <div>{value.completedQuantity}</div>
    },
    ...(currentUser?.currentUserStore?.role !== RoleType.STAFF
      ? [
          {
            title: 'Tác vụ',
            width: 200,
            fixed: 'right' as const,
            render: (value: RequestProduct) => (
              <div className='flex justify-center gap-4'>
                <BaseButton
                  variant='outlined'
                  color='danger'
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionType('cancel');
                    setModalCompleteOrCancel(true);
                    setValueRow(value);
                    setValueChange(value.quantity - value?.completedQuantity);
                  }}
                >
                  <IoClose className='text-[24px] text-danger' />
                </BaseButton>
                <BaseButton
                  variant='outlined'
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionType('complete');
                    setModalCompleteOrCancel(true);
                    setValueRow(value);
                    setValueChange(value.quantity - value?.completedQuantity);
                  }}
                >
                  <MdCheck className='text-[24px]' />
                </BaseButton>
                {currentUser?.kitchen?.isPrintEnabled && (
                  <BaseButton
                    variant='outlined'
                    onClick={(e) => {
                      e.stopPropagation();
                      setValueRow(value);
                      setTimeout(() => handlePrint(), 0);
                    }}
                  >
                    <AiOutlinePrinter className='text-[24px]' />
                  </BaseButton>
                )}
              </div>
            )
          }
        ]
      : [])
  ];
  //].filter((col): col is Exclude<typeof col, null> => col !== null);
  const handleConfirmOrReject = async (isComplete: boolean) => {
    await updateCompleteOrCancel(
      [
        {
          quantity: valueChange,
          id: valueRow?.id as string
        }
      ],
      isComplete
    );
    setModalCompleteOrCancel(false);
  };

  // Socket listeners
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: (newRequest: RequestTransferred) => {
          if (currentUser?.kitchen?.id !== newRequest?.requestProducts[0]?.kitchenId) return;
          setRequestProductInprogress((prevRequestProducts) => {
            const newRequestProducts = newRequest.requestProducts.map((item) => {
              return { ...item, request: newRequest };
            });
            const requestProducts = [...prevRequestProducts, ...newRequestProducts];
            const requestsProductInProgressSorted = requestProducts.sort(
              (a: RequestProduct, b: RequestProduct) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return {
              data: requestsProductInProgressSorted,
              total: requestProducts.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CANCELED,
        callback: (requestProduct: RequestProduct) => {
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
          setRequestProductInprogress((prevRequestProducts) => {
            const requestProducts = prevRequestProducts.filter(
              (requestProductInProgress) => requestProductInProgress.id !== requestProduct.id
            );
            return {
              data: requestProducts,
              total: requestProducts.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: RequestProduct) => {
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
          setRequestProductInprogress((prevRequestProducts) => {
            const foundIndex = prevRequestProducts.findIndex(
              (requestProductInProgress) => requestProductInProgress.id === requestProduct.id
            );
            if (foundIndex !== -1) {
              prevRequestProducts[foundIndex] = {
                ...prevRequestProducts[foundIndex],
                ...getUpdateRequestProductQuantity(requestProduct)
              };
            } else {
              prevRequestProducts.push(requestProduct);
            }
            const requestsProductInProgressSorted = prevRequestProducts.sort(
              (a: RequestProduct, b: RequestProduct) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return {
              data: requestsProductInProgressSorted,
              total: requestsProductInProgressSorted.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: RequestProduct) => {
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
          if (requestProduct.completedQuantity === requestProduct.quantity) return;
          setRequestProductInprogress((prevRequestProducts) => {
            const foundIndex = prevRequestProducts.findIndex(
              (requestProductInProgress) => requestProductInProgress.id === requestProduct.id
            );
            if (foundIndex !== -1) {
              prevRequestProducts[foundIndex] = {
                ...prevRequestProducts[foundIndex],
                ...getUpdateRequestProductQuantity(requestProduct)
              };
            } else {
              prevRequestProducts.push(requestProduct);
            }
            const requestsProductInProgressSorted = prevRequestProducts.sort(
              (a: RequestProduct, b: RequestProduct) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return {
              data: requestsProductInProgressSorted,
              total: requestsProductInProgressSorted.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: RequestProduct) => {
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
          setRequestProductInprogress((prevRequestProducts) => {
            const requestProducts = prevRequestProducts.filter(
              (requestProductInProgress) => requestProductInProgress.id !== requestProduct.id
            );
            return {
              data: requestProducts,
              total: requestProducts.length
            };
          });
        }
      }
    ],
    [filters]
  );
  return (
    <div>
      <div className='hidden xl:block h-full overflow-y-auto '>
        <Table<RequestProduct>
          columns={columns}
          scroll={{ y: '75vh' }}
          className='hidden-scroll-table custom-table'
          bordered={false}
          loading={isLoading}
          pagination={false}
          dataSource={requestsProductInProgress}
          onRow={(record) => ({
            onClick: (e) => {
              e.stopPropagation();
              setModalDetail(true);
              setValueRow(record);
            }
          })}
          locale={{ emptyText: <NoData /> }}
        />
      </div>
      <div className='block xl:hidden overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
        {!requestsProductInProgress?.length && <NoData />}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {!!requestsProductInProgress?.length &&
            requestsProductInProgress?.map((item: RequestProduct) => {
              return isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div
                  key={item?.id}
                  onClick={() => {
                    setModalDetail(true);
                    setValueRow(item);
                  }}
                >
                  <CardRequestProduct
                    productName={item?.productName}
                    note={item?.note || null}
                    table={`${item.request.table?.zone?.name} - ${item.request.table?.name}`}
                    quantityNeed={item.quantity}
                    quantityAvailble={item.completedQuantity}
                    reason={item?.requestProductHistories?.filter((item: HistoryRequest) => item.reason !== null) || []}
                    thumbnail={generateImageURL(item?.product?.thumbnail)}
                    permission={currentUser?.currentUserStore?.role !== RoleType.STAFF}
                    title='Hoàn thành'
                    time={capitalizeFirstLetter(dayjs(item?.request?.confirmedAt)?.fromNow())?.replace('tới', 'trước')}
                    onConfirm={() => {
                      setActionType('complete');
                      setModalCompleteOrCancel(true);
                      setValueRow(item);
                      setValueChange(item?.quantity - item?.completedQuantity);
                    }}
                    onCancel={() => {
                      setActionType('cancel');
                      setModalCompleteOrCancel(true);
                      setValueRow(item);
                      setValueChange(item?.quantity - item?.completedQuantity);
                    }}
                    onPrint={() => {
                      setValueRow(item);
                      setTimeout(() => handlePrint(), 0);
                    }}
                    isPrintEnabled={currentUser?.kitchen?.isPrintEnabled}
                  />
                </div>
              );
            })}
        </div>
      </div>
      <div className='hidden'>
        <div className='w-full' ref={contentRef}>
          <KitchenTickets
            data={valueRow}
            type='request'
            printType='single'
            tableName={`${valueRow?.request?.table?.name} - ${valueRow?.request?.table?.zone?.name}`}
          />
        </div>
      </div>
      <ChangeQuantityModal
        type={actionType === 'complete' ? 'primary' : 'danger'}
        isOpen={modalCompleteOrCancel}
        onClose={() => setModalCompleteOrCancel(false)}
        onConfirm={() => handleConfirmOrReject(actionType === 'complete' ? true : false)}
        icon={<IoMdNotificationsOutline className='text-[26px] text-successGreen' />}
        loading={isLoading}
        buttonClassName={actionType === 'complete' ? 'bg-primary' : 'bg-danger'}
        confirmLabel={actionType === 'complete' ? 'Xác nhận' : 'Đồng ý'}
      >
        <div>
          <p className='text-center font-light text-[16px]'>
            Xác nhận <span className='font-semibold text-black'>{actionType === 'complete' ? 'đã' : 'huỷ'}</span> chế
            biến món <span className='font-semibold text-black'>{valueRow?.productName}</span> với số lượng:
          </p>
          <div className='flex justify-center my-3'>
            <QuantityInput
              className='text-[16px]'
              disabled={(valueRow?.quantity || 0) - (valueRow?.completedQuantity || 0) <= valueChange}
              value={valueChange}
              onChange={(value) => setValueChange(value)}
            />
          </div>
        </div>
      </ChangeQuantityModal>
      <ModalDetail
        confirmLabel='Đóng'
        detail={valueRow}
        onClose={() => setModalDetail(false)}
        onConfirm={() => setModalDetail(false)}
        isOpen={modalDetail}
      />
    </div>
  );
}
