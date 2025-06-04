import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import CardRequestProduct from '../../components/CardRequestProduct';
import { HistoryRequest, TRequest, TRequestProduct } from 'src/types/request.type';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { IoMdNotificationsOutline } from 'react-icons/io';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import dayjs from 'dayjs';
import { LoadingFullPage } from 'src/shared/components/Loading/LoadingFullPage';
import { RoleType, SocketEnum } from 'src/shared/common/enum';
import { getSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import useAuthStore from 'src/store/authStore';
import { Dropdown, Empty, Skeleton } from 'antd';
import { FiMoreHorizontal, FiXCircle } from 'react-icons/fi';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { MenuProps } from 'antd/lib';
import ActionModal from '../../components/ActionModal';
import { SlClose } from 'react-icons/sl';
import useLayoutStore from 'src/store/layoutStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import ChangeQuantityModal from '../../components/ChangeQuantityModal';
import BaseButton from 'src/shared/components/Buttons/Button';
import { CgArrowsExchange } from 'react-icons/cg';
import { AiOutlinePrinter } from 'react-icons/ai';
import { useReactToPrint } from 'react-to-print';
import KitchenTickets from '../components/KitchenTickets';

export default function TableInProgressDetail({ filters }: { filters?: FilterKitchen }) {
  const { tableId, zoneId } = useParams();
  const navigate = useNavigate();
  const { fetchTableInProgress, dataTableInProgress, isLoading, updateCompleteOrCancel, setTableInprogress } =
    useRequestProductStore();
  const [actionType, setActionType] = useState<'complete' | 'cancel'>('complete');
  const [modalCompleteOrCancel, setModalCompleteOrCancel] = useState<boolean>(false);
  const [valueRow, setValueRow] = useState<TRequestProduct>();
  const [valueChange, setValueChange] = useState<number>(0);
  const { currentUser } = useAuthStore();
  const [modalAction, setModalAction] = useState<boolean>(false);
  const [requestProducts, setRequestProducts] = useState<any[]>([]);
  const [updatedList, setUpdatedList] = useState<any[]>([]);
  useEffect(() => {
    fetchTableInProgress({ zoneId, tableId });
  }, []);

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

  const data = useMemo(() => {
    if (!dataTableInProgress || dataTableInProgress.length === 0) return [];

    return dataTableInProgress[0]?.requests
      .map((itemRequest: TRequest) => ({
        confirmedAt: capitalizeFirstLetter(dayjs(itemRequest?.confirmedAt).fromNow()).replace('tới', 'trước'),
        list: itemRequest.requestProducts,
        name: dataTableInProgress[0]?.name,
        zone: dataTableInProgress[0]?.zone
      }))
      .flat();
  }, [dataTableInProgress]);
  const createNewRequestProduct = (requestProduct: any) => ({
    id: requestProduct.id,
    createdAt: requestProduct.createdAt,
    productId: requestProduct.productId,
    productName: requestProduct.productName,
    quantity: requestProduct.quantity,
    completedQuantity: requestProduct.completedQuantity,
    servedQuantity: requestProduct.servedQuantity,
    note: requestProduct.note,
    reason: requestProduct.reason,
    price: requestProduct.price,
    requestProductHistories: requestProduct.requestProductHistories,
    status: requestProduct.status,
    product: {
      thumbnail: requestProduct?.product?.thumbnail
    }
  });

  const createNewTableWithRequest = (requestProduct: any) => ({
    id: requestProduct.request.table.id,
    name: requestProduct.request.table.name,
    zone: requestProduct.request.table.zone,
    requests: [
      {
        id: requestProduct.request.id,
        note: requestProduct.note,
        confirmedAt: requestProduct.request.confirmedAt,
        sessionCustomer: requestProduct.request.sessionCustomer,
        requestProducts: [createNewRequestProduct(requestProduct)]
      }
    ]
  });

  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: (newRequest: any) => {
          setTableInprogress((prevTables) => {
            const requestExists = prevTables.some((table) =>
              table.requests.some((request) => request.id === newRequest.id)
            );

            if (requestExists) {
              return { data: prevTables, total: prevTables.length };
            }

            const existingTableIndex = prevTables.findIndex((table) => table.id === newRequest.table.id);
            if (existingTableIndex !== -1) {
              const updatedTables = [...prevTables];
              updatedTables[existingTableIndex] = {
                ...updatedTables[existingTableIndex],
                requests: [...updatedTables[existingTableIndex].requests, newRequest]
              };
              return {
                data: updatedTables,
                total: updatedTables.length
              };
            } else {
              const newTable = {
                id: newRequest.table.id,
                name: newRequest.table.name,
                zone: newRequest.table.zone,
                requests: [newRequest]
              };
              return {
                data: [...prevTables, newTable],
                total: prevTables.length + 1
              };
            }
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CANCELED,
        callback: (requestProduct: any) => {
          setTableInprogress((prevTables) => {
            const updatedTables = prevTables
              .map((table) => {
                // Bước 1: Cập nhật requests cho mỗi bàn
                const updatedRequests = table.requests
                  .map((request) => ({
                    ...request,
                    requestProducts: request.requestProducts.filter((product) => product.id !== requestProduct.id)
                  }))
                  .filter((request) => request.requestProducts.length > 0);

                // Bước 2: Trả về bàn được cập nhật
                return {
                  ...table,
                  requests: updatedRequests
                };
              })
              // Bước 3: Chỉ giữ lại những bàn vẫn còn yêu cầu sau khi lọc
              .filter((table) => table.requests.length > 0);

            return { data: updatedTables, total: updatedTables.length };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: any) => {
          if (requestProduct.completedQuantity === requestProduct.quantity) return;
          setTableInprogress((prevTables) => {
            const tableId = requestProduct.request.table.id;
            const requestId = requestProduct.request.id;
            const existingTable = prevTables.find((table) => table.id === tableId);

            if (existingTable) {
              const updatedTables = prevTables.map((table) => {
                if (table.id !== tableId) return table;

                // Find existing request
                const existingRequest = table.requests.find((request) => request.id === requestId);

                if (existingRequest) {
                  // Update existing request
                  const updatedRequests = table.requests.map((request) => {
                    if (request.id !== requestId) return request;

                    const updatedRequestProducts = request.requestProducts.map((product) =>
                      product.id === requestProduct.id
                        ? { ...product, ...getUpdateRequestProductQuantity(requestProduct) }
                        : product
                    );

                    // Add new product if not found
                    if (!updatedRequestProducts.some((product) => product.id === requestProduct.id)) {
                      updatedRequestProducts.push(createNewRequestProduct(requestProduct));
                    }

                    return { ...request, requestProducts: updatedRequestProducts };
                  });

                  return { ...table, requests: updatedRequests };
                } else {
                  // Add new request to existing table
                  return {
                    ...table,
                    requests: [
                      ...table.requests,
                      {
                        id: requestProduct.request.id,
                        note: requestProduct.request.note,
                        confirmedAt: requestProduct.request.confirmedAt,
                        sessionCustomer: requestProduct.request.sessionCustomer,
                        requestProducts: [createNewRequestProduct(requestProduct)]
                      }
                    ].sort(
                      (a: TRequest, b: TRequest) =>
                        new Date(a.confirmedAt as string).getTime() - new Date(b.confirmedAt as string).getTime()
                    )
                  };
                }
              });

              return { data: updatedTables, total: updatedTables.length };
            }

            // Add new table if not found
            return {
              data: [...prevTables, createNewTableWithRequest(requestProduct)],
              total: prevTables.length + 1
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: any) => {
          setTableInprogress((prevTables) => {
            const tableId = requestProduct.request.table.id;
            const requestId = requestProduct.request.id;
            const existingTable = prevTables.find((table) => table.id === tableId);
            if (existingTable) {
              const updatedTables = prevTables.map((table) => {
                if (table.id !== tableId) return table;

                // Find existing request
                const existingRequest = table.requests.find((request) => request.id === requestId);
                if (existingRequest) {
                  // Update existing request
                  const updatedRequests = table.requests.map((request) => {
                    if (request.id !== requestId) return request;

                    const updatedRequestProducts = request.requestProducts.map((product) =>
                      product.id === requestProduct.id
                        ? { ...product, ...getUpdateRequestProductQuantity(requestProduct) }
                        : product
                    );

                    // Add new product if not found
                    if (!updatedRequestProducts.some((product) => product.id === requestProduct.id)) {
                      updatedRequestProducts.push(createNewRequestProduct(requestProduct));
                    }
                    return { ...request, requestProducts: updatedRequestProducts };
                  });

                  return { ...table, requests: updatedRequests };
                } else {
                  // Add new request to existing table
                  return {
                    ...table,
                    requests: [
                      ...table.requests,
                      {
                        id: requestProduct.request.id,
                        note: requestProduct.request.note,
                        confirmedAt: requestProduct.request.confirmedAt,
                        sessionCustomer: requestProduct.request.sessionCustomer,
                        requestProducts: [createNewRequestProduct(requestProduct)]
                      }
                    ].sort(
                      (a: TRequest, b: TRequest) =>
                        new Date(a.confirmedAt as string).getTime() - new Date(b.confirmedAt as string).getTime()
                    )
                  };
                }
              });

              return { data: updatedTables, total: updatedTables.length };
            }

            return {
              data: [...prevTables, createNewTableWithRequest(requestProduct)],
              total: prevTables.length + 1
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: any) => {
          setTableInprogress((prevTables) => {
            const tableId = requestProduct.request.table.id;
            const requestId = requestProduct.request.id;
            const existingTable = prevTables.find((table) => table.id === tableId);

            if (existingTable) {
              const updatedTables = prevTables.map((table) => {
                if (table.id !== tableId) return table;

                // Find existing request
                const existingRequest = table.requests.find((request) => request.id === requestId);

                if (existingRequest) {
                  // Update existing request
                  const updatedRequests = table.requests.map((request) => {
                    if (request.id !== requestId) return request;

                    const updatedRequestProducts = request.requestProducts.filter(
                      (product) => product.id !== requestProduct.id
                    );

                    if (updatedRequestProducts.length === 0) {
                      return null;
                    }

                    return { ...request, requestProducts: updatedRequestProducts };
                  });

                  // Remove null requests
                  const filteredRequests = updatedRequests.filter((request): request is TRequest => request !== null);

                  return { ...table, requests: filteredRequests };
                }

                return table;
              });

              // Filter tables with no requests
              const filteredTables = updatedTables.filter((table) => table.requests.length > 0);

              return { data: filteredTables, total: filteredTables.length };
            }

            return { data: prevTables, total: prevTables.length };
          });
        }
      }
    ],
    [filters, isLoading]
  );

  const handleChangeValue = (index: number, value: number) => {
    const newList = [...updatedList];
    const item = newList[index];
    const newServedQuantity = (item.quantity || 0) - value;
    newList[index] = { ...item, completedQuantity: newServedQuantity };
    setUpdatedList(newList);
  };
  const handleConfirmOrRejectRequests = async (isComplete: boolean) => {
    setModalAction(false);
    await updateCompleteOrCancel(
      updatedList?.map((item) => ({
        id: item?.id,
        quantity: item?.quantity - item?.completedQuantity
      })),
      isComplete
    );
  };
  const { collapsed } = useLayoutStore();

  const collapsedCss = () => {
    if (collapsed) return 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3';
    return 'md:grid-cols-2 lg:grid-cols-2';
  };
  const multiTableRef = useRef(null);

  const handlePrintMultiTable = useReactToPrint({
    contentRef: multiTableRef,
    documentTitle: 'Bếp',
    pageStyle: `
      @media print {
        .page-break-after {
          page-break-after: always;
        }
      }
    `
  });
  return (
    <DetailHeader
      title={
        <div className='flex w-full justify-between'>
          <h2 className='text-black font-semibold text-[16px] sm:text-xl xl:text-2xl text-start line-clamp-2 max-w-[200px] md:max-w-full'>
            {currentUser?.kitchen?.name}
          </h2>
          <div className='items-center gap-3'>
            <BaseButton
              icon={<AiOutlinePrinter size={20} className='mt-1' />}
              className='rounded-md px-4 py-2'
              onClick={(e) => {
                e.stopPropagation();
                handlePrintMultiTable();
              }}
            >
              In tất cả
            </BaseButton>
          </div>
        </div>
      }
      handleBack={() => navigate(-1)}
    >
      {isLoading && <Skeleton active paragraph={{ rows: 3 }} />}
      {!data?.length && <NoData />}
      <div>
        <div className='block overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
          <div className='flex flex-col gap-4'>
            {!isLoading &&
              !!data?.length &&
              data?.map((item: { confirmedAt: string; list: TRequestProduct[] }, groupIndex: number) => (
                <div key={groupIndex} className='w-full mb-4'>
                  <div className='flex justify-start items-center mb-[15px]'>
                    <p className='text-base text-primary font-semibold'>Yêu cầu {groupIndex + 1}</p>
                    <div className='flex items-center justify-end gap-x-[10px] w-[160px]'>
                      {currentUser?.currentUserStore?.role !== RoleType.STAFF && (
                        <>
                          <div
                            onClick={() => {
                              setActionType('cancel');
                              setRequestProducts(item.list);
                              setUpdatedList(item.list);
                              setModalAction(true);
                            }}
                            className={`shadow-md w-[30px] h-[30px] rounded-md flex justify-center items-center bg-danger hover:bg-red-400 transition-colors cursor-pointer`}
                          >
                            <SlClose size={20} color='white' />
                          </div>
                          <div
                            onClick={() => {
                              setActionType('complete');
                              setRequestProducts(item.list);
                              setUpdatedList(item.list);
                              setModalAction(true);
                            }}
                            className='bg-primary text-white flex items-center gap-x-[10px] px-2 rounded-[5px] py-[5px] cursor-pointer text-[12px] hover:bg-primary-400 transition-colors'
                          >
                            <FaRegCircleCheck size={20} /> <span>Hoàn thành</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
                    {item.list.map((itemrequest: TRequestProduct, productIndex: number) => (
                      <CardRequestProduct
                        key={`${groupIndex}-${productIndex}`}
                        productName={itemrequest?.productName}
                        note={itemrequest?.note || null}
                        table={`${dataTableInProgress[0]?.zone?.name} - ${dataTableInProgress[0]?.name}`}
                        quantityNeed={itemrequest?.quantity}
                        quantityAvailble={itemrequest?.completedQuantity}
                        time={item?.confirmedAt}
                        thumbnail={generateImageURL(itemrequest?.product?.thumbnail)}
                        permission={currentUser?.currentUserStore?.role !== RoleType.STAFF}
                        reason={itemrequest?.requestProductHistories}
                        title={'Hoàn thành'}
                        onConfirm={() => {
                          setActionType('complete');
                          setModalCompleteOrCancel(true);
                          setValueRow(itemrequest);
                          setValueChange(itemrequest?.quantity - itemrequest?.completedQuantity);
                        }}
                        onCancel={() => {
                          setActionType('cancel');
                          setModalCompleteOrCancel(true);
                          setValueRow(itemrequest);
                          setValueChange(itemrequest?.quantity - itemrequest?.completedQuantity);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
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
      <ActionModal
        isOpen={modalAction}
        onClose={() => {
          setModalAction(false);
          setRequestProducts([]);
          setUpdatedList([]);
        }}
        handleChangeValue={handleChangeValue}
        actionType={actionType}
        onConfirm={() => handleConfirmOrRejectRequests(actionType === 'complete' ? true : false)}
        data={updatedList}
        dataTemp={requestProducts}
      />
      <div className='hidden'>
        <div ref={multiTableRef} className='w-full'>
          <div className='flex flex-col gap-4 w-full'>
            {!!data?.length &&
              data?.map((table: any, index: number) => {
                return (
                  <div key={table.id}>
                    <div className='print-content page-break-after'>
                      <KitchenTickets
                        key={table.id}
                        data={table}
                        type='table'
                        printType='single'
                        index={index}
                        tableName={`${table?.zone?.name} - ${table?.name}`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </DetailHeader>
  );
}
