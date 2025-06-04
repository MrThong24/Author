import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import useRequestProductStore from 'src/store/useRequestProductStore';
import CardRequestProductByCustomer from '../../components/CardRequestProductByCustomer';
import { HistoryRequest, RequestAllData, TRequestProduct } from 'src/types/request.type';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { RoleType, SocketEnum } from 'src/shared/common/enum';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import useAuthStore from 'src/store/authStore';
import { Empty } from 'antd';
import { LoadingFullPage } from 'src/shared/components/Loading/LoadingFullPage';
import useLayoutStore from 'src/store/layoutStore';
import NoData from 'src/cms/components/NoData/NoData';
import ChangeQuantityModal from '../../components/ChangeQuantityModal';
import { useReactToPrint } from 'react-to-print';
import KitchenTickets from '../components/KitchenTickets';
import BaseButton from 'src/shared/components/Buttons/Button';
import { AiOutlinePrinter } from 'react-icons/ai';

export default function AllProgressDetail() {
  const { productId, tableId, zoneId } = useParams();
  const navigate = useNavigate();
  const { fetchAllInProgress, dataAllInProgress, isLoading, updateCompleteOrCancel, setAllInprogress } =
    useRequestProductStore();
  const [modalCompleteOrCancel, setModalCompleteOrCancel] = useState<boolean>(false);
  const [valueRow, setValueRow] = useState<TRequestProduct>();
  const [actionType, setActionType] = useState<'complete' | 'cancel'>('complete');
  const [valueChange, setValueChange] = useState<number>(0);
  const { currentUser } = useAuthStore();
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Bếp'
  });

  useEffect(() => {
    fetchAllInProgress({
      tableId: tableId === 'undefined' ? null : tableId,
      zoneId: zoneId === 'undefined' ? null : zoneId
    });
  }, [tableId, zoneId]);

  const data = useMemo(() => {
    if (!dataAllInProgress || dataAllInProgress.length === 0) return [];

    return dataAllInProgress.filter((itemRequestProduct) => itemRequestProduct.productId === productId);
  }, [dataAllInProgress, productId]);

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
        callback: (newRequest: any) => {
          setAllInprogress((prevTables) => {
            let updatedData = [...prevTables];

            // Handle each request product
            newRequest.requestProducts.forEach((requestProduct: any) => {
              // Find if the product already exists
              const existingProductIndex = updatedData.findIndex((item) => item.productId === requestProduct.productId);

              if (existingProductIndex !== -1) {
                // Product exists, update its requestProducts array
                const existingProduct = updatedData[existingProductIndex];

                // Check if the specific request product already exists
                const requestProductExists = existingProduct.requestProducts.some((rp) => rp.id === requestProduct.id);

                if (!requestProductExists) {
                  // Add request details to the request product
                  const enrichedRequestProduct = {
                    ...requestProduct,
                    request: {
                      id: newRequest.id,
                      table: newRequest.table,
                      confirmedAt: newRequest.confirmedAt,
                      sessionCustomer: newRequest.sessionCustomer
                    }
                  };

                  updatedData[existingProductIndex] = {
                    ...existingProduct,
                    totalQuantity: String(Number(existingProduct.totalQuantity) + requestProduct.quantity),
                    requestProducts: [...existingProduct.requestProducts, enrichedRequestProduct]
                  };
                }
              } else {
                // Product doesn't exist, create new entry
                const newProduct = {
                  productId: requestProduct.productId,
                  productName: requestProduct.productName,
                  minCreatedAt: requestProduct.createdAt,
                  totalQuantity: String(requestProduct.quantity),
                  product: {
                    thumbnail: requestProduct?.product?.thumbnail
                  },
                  requestProducts: [
                    {
                      ...requestProduct,
                      request: {
                        id: newRequest.id,
                        table: newRequest.table,
                        confirmedAt: newRequest.confirmedAt,
                        sessionCustomer: newRequest.sessionCustomer
                      }
                    }
                  ]
                };

                updatedData.push(newProduct);
              }
            });

            return {
              data: updatedData,
              total: updatedData.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CANCELED,
        callback: (requestProduct: any) => {
          setAllInprogress((prevTables) => {
            const updatedTables = prevTables
              .map((product) => {
                // Remove the canceled request product
                const updatedRequestProducts = product.requestProducts.filter((rp) => rp.id !== requestProduct.id);

                // If there are still request products, update the total quantity
                if (updatedRequestProducts.length > 0) {
                  const newTotalQuantity = updatedRequestProducts.reduce((total, rp) => total + rp.quantity, 0);

                  return {
                    ...product,
                    totalQuantity: String(newTotalQuantity),
                    requestProducts: updatedRequestProducts
                  };
                }
                return null;
              })
              // Remove products with no request products
              .filter((product): product is RequestAllData => product !== null);
            return {
              data: updatedTables,
              total: updatedTables.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: any) => {
          if (requestProduct.completedQuantity === requestProduct.quantity) return;
          setAllInprogress((prevTables) => {
            let updatedData = [...prevTables];
            const existingProductIndex = updatedData.findIndex((item) => item.productId === requestProduct.productId);

            if (existingProductIndex !== -1) {
              const existingProduct = updatedData[existingProductIndex];

              // Sort requestProducts by createdAt in descending order
              existingProduct.requestProducts.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              const requestProductIndex = existingProduct.requestProducts.findIndex(
                (rp) => rp.id === requestProduct.id
              );

              if (requestProductIndex !== -1) {
                existingProduct.requestProducts[requestProductIndex] = {
                  ...existingProduct.requestProducts[requestProductIndex],
                  quantity: requestProduct.quantity,
                  completedQuantity: requestProduct.completedQuantity,
                  servedQuantity: requestProduct.servedQuantity,
                  note: requestProduct.note,
                  status: requestProduct.status,
                  requestProductHistories: requestProduct.requestProductHistories
                };
              } else {
                existingProduct.requestProducts.push({
                  ...requestProduct,
                  request: {
                    id: requestProduct.request.id,
                    table: requestProduct.request.table,
                    confirmedAt: requestProduct.request.confirmedAt,
                    sessionCustomer: requestProduct.request.sessionCustomer
                  }
                });
              }

              // Sort again after adding/updating
              existingProduct.requestProducts.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              // Update total quantity
              const newTotalQuantity = existingProduct.requestProducts.reduce((total, rp) => total + rp.quantity, 0);

              updatedData[existingProductIndex] = {
                ...existingProduct,
                totalQuantity: String(newTotalQuantity)
              };
            } else {
              // Product doesn't exist, create new entry
              const newProduct = {
                productId: requestProduct.productId,
                productName: requestProduct.productName,
                minCreatedAt: requestProduct.createdAt,
                totalQuantity: String(requestProduct.quantity),
                product: {
                  thumbnail: requestProduct?.product?.thumbnail
                },
                requestProducts: [
                  {
                    ...requestProduct,
                    request: {
                      id: requestProduct.request.id,
                      table: requestProduct.request.table,
                      confirmedAt: requestProduct.request.confirmedAt,
                      sessionCustomer: requestProduct.request.sessionCustomer
                    }
                  }
                ]
              };

              updatedData.push(newProduct);
            }

            return {
              data: updatedData,
              total: updatedData.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: any) => {
          setAllInprogress((prevTables) => {
            let updatedData = [...prevTables];
            const existingProductIndex = updatedData.findIndex((item) => item.productId === requestProduct.productId);

            if (existingProductIndex !== -1) {
              const existingProduct = updatedData[existingProductIndex];

              // Sort requestProducts by createdAt in descending order
              existingProduct.requestProducts.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              const requestProductIndex = existingProduct.requestProducts.findIndex(
                (rp) => rp.id === requestProduct.id
              );

              if (requestProductIndex !== -1) {
                existingProduct.requestProducts[requestProductIndex] = {
                  ...existingProduct.requestProducts[requestProductIndex],
                  quantity: requestProduct.quantity,
                  completedQuantity: requestProduct.completedQuantity,
                  servedQuantity: requestProduct.servedQuantity,
                  note: requestProduct.note,
                  status: requestProduct.status,
                  requestProductHistories: requestProduct.requestProductHistories
                };
              } else {
                existingProduct.requestProducts.push({
                  ...requestProduct,
                  request: {
                    id: requestProduct.request.id,
                    table: requestProduct.request.table,
                    confirmedAt: requestProduct.request.confirmedAt,
                    sessionCustomer: requestProduct.request.sessionCustomer
                  }
                });
              }

              // Sort again after adding/updating
              existingProduct.requestProducts.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              // Update total quantity
              const newTotalQuantity = existingProduct.requestProducts.reduce((total, rp) => total + rp.quantity, 0);

              updatedData[existingProductIndex] = {
                ...existingProduct,
                totalQuantity: String(newTotalQuantity)
              };
            } else {
              // Product doesn't exist, create new entry
              const newProduct = {
                productId: requestProduct.productId,
                productName: requestProduct.productName,
                minCreatedAt: requestProduct.createdAt,
                totalQuantity: String(requestProduct.quantity),
                product: {
                  thumbnail: requestProduct?.product?.thumbnail
                },
                requestProducts: [
                  {
                    ...requestProduct,
                    request: {
                      id: requestProduct.request.id,
                      table: requestProduct.request.table,
                      confirmedAt: requestProduct.request.confirmedAt,
                      sessionCustomer: requestProduct.request.sessionCustomer
                    }
                  }
                ]
              };

              updatedData.push(newProduct);
            }

            return {
              data: updatedData,
              total: updatedData.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: any) => {
          setAllInprogress((prevTables) => {
            const updatedTables = prevTables
              .map((product) => {
                // Remove the completed request product
                const updatedRequestProducts = product.requestProducts.filter((rp) => rp.id !== requestProduct.id);

                // If there are still request products, update the total quantity
                if (updatedRequestProducts.length > 0) {
                  const newTotalQuantity = updatedRequestProducts.reduce((total, rp) => total + rp.quantity, 0);

                  return {
                    ...product,
                    totalQuantity: String(newTotalQuantity),
                    requestProducts: updatedRequestProducts
                  };
                }
                return null;
              })
              // Remove products with no request products
              .filter((product): product is RequestAllData => product !== null);
            return {
              data: updatedTables,
              total: updatedTables.length
            };
          });
        }
      }
    ],
    []
  );
  const { collapsed } = useLayoutStore();

  const collapsedCss = () => {
    if (collapsed) return 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3';
    return 'md:grid-cols-2 lg:grid-cols-2';
  };

  return (
    <DetailHeader
      title={
        <div className='flex w-full justify-between'>
          <h2 className='text-black font-semibold text-[16px] sm:text-xl xl:text-2xl text-start line-clamp-2 max-w-[200px] md:max-w-full'>
            {data[0]?.productName}
          </h2>
          <div className='items-center gap-3'>
            <BaseButton
              icon={<AiOutlinePrinter size={20} className='mt-1' />}
              className='rounded-md px-4 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handlePrint();
              }}
            >
              In tất cả
            </BaseButton>
          </div>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      {isLoading && <LoadingFullPage loading={true} />}
      <div className='block overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
        {!data?.length && <NoData />}
        <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
          {!!data?.length &&
            data[0]?.requestProducts
              .sort(
                (a, b) =>
                  new Date(a?.request?.confirmedAt || 0).getTime() - new Date(b?.request?.confirmedAt || 0).getTime()
              )
              ?.map((item) => (
                <div key={item?.id}>
                  <CardRequestProductByCustomer
                    customerName={item?.request?.sessionCustomer?.customer?.name || ''}
                    quantityNeed={item?.quantity}
                    note={item?.note}
                    quantityAvailble={item?.completedQuantity}
                    tableAndZoneName={`${item?.request?.table?.zone?.name} - ${item?.request?.table?.name}`}
                    time={item?.request?.confirmedAt || ''}
                    reason={item?.requestProductHistories?.sort(
                      (a: HistoryRequest, b: HistoryRequest) =>
                        new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime()
                    )}
                    permission={currentUser?.currentUserStore?.role !== RoleType.STAFF}
                    title={'Hoàn thành'}
                    onConfirm={() => {
                      setActionType('complete');
                      setModalCompleteOrCancel(true);
                      setValueRow({
                        ...item,
                        productId: data[0]?.productId,
                        productName: data[0]?.productName
                      });
                      setValueChange(item?.quantity - item?.completedQuantity);
                    }}
                    onCancel={() => {
                      setActionType('cancel');
                      setModalCompleteOrCancel(true);
                      setValueRow({
                        ...item,
                        productId: data[0]?.productId,
                        productName: data[0]?.productName
                      });
                      setValueChange(item?.quantity - item?.completedQuantity);
                    }}
                  />
                </div>
              ))}
        </div>
      </div>
      <ChangeQuantityModal
        type={actionType === 'complete' ? 'primary' : 'danger'}
        isOpen={modalCompleteOrCancel}
        onClose={() => setModalCompleteOrCancel(false)}
        onConfirm={() => handleConfirmOrReject(actionType === 'complete' ? true : false)}
        icon={<IoMdNotificationsOutline className='text-[26px] text-successGreen' />}
        loading={isLoading}
        confirmLabel={actionType === 'complete' ? 'Xác nhận' : 'Huỷ phục vụ'}
      >
        <div>
          <p className='text-center font-light text-[16px]'>
            Bạn muốn xác nhận{' '}
            <span className='font-semibold text-black'>{actionType === 'complete' ? 'đã' : 'huỷ'}</span> thực hiện món{' '}
            <span className='font-semibold text-black'>{valueRow?.productName}</span> với số lượng:
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
      <div className='hidden'>
        <div className='w-full' ref={contentRef}>
          <KitchenTickets data={data[0]} type={'all'} printType='single' />
        </div>
      </div>
      {/* <ActionModal
        isOpen={modalAction}
        onClose={() => {
          setModalAction(false);
          setRequestProducts([]);
          setUpdatedList([]);
        }}
        handleChangeValue={handleChangeValue}
        actionType={actionType}
        onConfirm={() => handleConfirmOrReject(actionType === 'complete' ? true : false)}
        data={updatedList}
        dataTemp={requestProducts}
      /> */}
    </DetailHeader>
  );
}
