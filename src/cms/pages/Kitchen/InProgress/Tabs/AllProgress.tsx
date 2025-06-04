import { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Skeleton, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { IoClose } from 'react-icons/io5';
import { MdCheck } from 'react-icons/md';
import BaseButton from 'src/shared/components/Buttons/Button';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { HistoryRequest, RequestAllData, RequestProduct, RequestProductInfo } from 'src/types/request.type';
import ActionModal from '../../components/ActionModal';
import { AiOutlinePrinter, AiOutlineUser } from 'react-icons/ai';
import { RoleType } from 'src/shared/common/enum';
import useAuthStore from 'src/store/authStore';
import { useNavigate } from 'react-router-dom';
import CardRequestProductTable from '../../components/CardRequestProductTable';
import { PiNotePencil } from 'react-icons/pi';
import { getSocket, useMultiSocketEvents } from 'src/shared/utils/socket';
import { SocketEnum } from 'src/shared/common/enum';
import { capitalizeFirstLetter } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import { useTheme } from 'src/provider/ThemeContext';
import { FiMinus, FiPlus } from 'react-icons/fi';
import useLayoutStore from 'src/store/layoutStore';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import { useReactToPrint } from 'react-to-print';
import KitchenTickets from '../components/KitchenTickets';

export interface ExpandedDataType {
  key: string;
  productName: string;
  quantity: number;
  completedQuantity: number;
  note: string | null;
  reason: string | null;
  confirmedAt: string;
  customerName: string;
  servedQuantity: number;
  table: string;
  zone: string;
  requestProductHistories?: HistoryRequest[];
  group?: ExpandedDataType[];
}

interface DataType {
  key: string;
  productName: string;
  completedQuantity: number;
  servedQuantity: number;
  expandDataSourceList?: ExpandedDataType[][];
  product: {
    thumbnail: string;
  };
}

export default function AllProgress({ filters }: { filters: FilterKitchen }) {
  const { theme } = useTheme();
  const { dataAllInProgress, isLoading, updateCompleteOrCancel, setAllInprogress } = useRequestProductStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [modalAction, setModalAction] = useState<boolean>(false);
  const [requestProducts, setRequestProducts] = useState<any[]>([]);
  const [updatedList, setUpdatedList] = useState<any[]>([]);
  const [actionType, setActionType] = useState<'complete' | 'cancel'>('complete');
  const [valuePrint, setValuePrint] = useState({});
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Bếp'
  });

  const dataRequestsProductAll = useMemo(() => {
    return dataAllInProgress?.map((item: RequestAllData): DataType => {
      let servedAndCompletedQuantity = item.requestProducts.reduce(
        (acc, product) => {
          acc.quantity += product.quantity;
          acc.completedQuantity += product.completedQuantity;
          acc.servedQuantity += product.quantity;
          return acc;
        },
        { quantity: 0, completedQuantity: 0, servedQuantity: 0 }
      );
      return {
        key: item?.productId,
        productName: item?.productName,
        product: {
          thumbnail: item?.requestProducts[0]?.product?.thumbnail
        },
        expandDataSourceList: [
          item?.requestProducts
            ?.map(
              (itemRequests: RequestProductInfo): ExpandedDataType => ({
                key: itemRequests.id as string,
                productName: item?.productName,
                note: itemRequests?.note || '',
                reason: itemRequests?.reason || '',
                confirmedAt: itemRequests?.request?.confirmedAt || '',
                customerName: itemRequests?.request?.sessionCustomer?.customer?.name || '',
                quantity: itemRequests?.quantity,
                completedQuantity: itemRequests?.completedQuantity,
                servedQuantity: itemRequests?.quantity,
                table: itemRequests?.request?.table?.name || '',
                zone: itemRequests?.request?.table?.zone?.name || '',
                requestProductHistories: itemRequests?.requestProductHistories?.sort(
                  (a: HistoryRequest, b: HistoryRequest) =>
                    new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime()
                )
              })
            )
            .sort(
              (a: ExpandedDataType, b: ExpandedDataType) =>
                new Date(a?.confirmedAt).getTime() - new Date(b?.confirmedAt).getTime()
            )
        ],
        completedQuantity: servedAndCompletedQuantity.completedQuantity,
        servedQuantity: servedAndCompletedQuantity.servedQuantity
      };
    });
  }, [dataAllInProgress, filters]);
  const columns: TableColumnsType<DataType> = [
    {
      title: 'Món ăn',
      dataIndex: 'productName',
      minWidth: 265,
      width: 255,
      align: 'left',
      render: (value) => <p className='text-base text-primary font-semibold w-full'>{value}</p>
    },
    {
      title: 'Cần thực hiện',
      align: 'center',
      dataIndex: 'servedQuantity',
      width: 100,
      className: 'text-primary'
    },
    {
      title: 'Đã thực hiện',
      align: 'center',
      dataIndex: 'completedQuantity',
      width: 100,
      className: 'text-primary'
    },
    ...(currentUser?.currentUserStore?.role !== RoleType.STAFF
      ? [
          {
            fixed: 'right' as const,
            title: 'Tác vụ',
            dataIndex: 'actions',
            width: 160,
            render: (_value: RequestProduct, record: DataType) => (
              <div className='flex gap-4 justify-center'>
                <BaseButton
                  variant='outlined'
                  color='danger'
                  onClick={(e) => {
                    e.stopPropagation();
                    const productsForTable = record.expandDataSourceList?.flat() || [];
                    setActionType('cancel');
                    setRequestProducts(productsForTable);
                    setModalAction(true);
                  }}
                >
                  <IoClose className='text-[24px] text-danger' />
                </BaseButton>
                <BaseButton
                  variant='outlined'
                  onClick={(e) => {
                    e.stopPropagation();
                    const productsForTable = record.expandDataSourceList?.flat() || [];
                    setActionType('complete');
                    setRequestProducts(productsForTable);
                    setModalAction(true);
                  }}
                >
                  <MdCheck className='text-[24px]' />
                </BaseButton>
                {currentUser?.kitchen?.isPrintEnabled && (
                  <BaseButton
                    variant='outlined'
                    onClick={(e) => {
                      e.stopPropagation();
                      setValuePrint(record);
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

  const expandColumns: TableColumnsType<ExpandedDataType> = [
    {
      title: 'Bàn',
      align: 'left',
      width: 320,
      render: (value: ExpandedDataType) => {
        return (
          <div className='flex flex-col gap-2 xl:items-start '>
            <div className='flex text-center items-center gap-2'>
              {value?.zone && value?.table && (
                <p className='font-semibold break-words text-[15px] text-primary'>
                  {value?.zone} - {value?.table}
                </p>
              )}
              {value?.confirmedAt && (
                <span className='text-green-500 font-medium text-[10px] inline-block rounded-[5px] bg-green-500/10 px-2 py-[2px]'>
                  {capitalizeFirstLetter(
                    dayjs(dayjs(value?.confirmedAt).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')).fromNow()
                  ).replace('tới', 'trước')}
                </span>
              )}
            </div>
            <div className='flex flex-col text-center items-start '>
              <p className='font-semibold break-words text-[15px] text-black'>{value?.productName}</p>
            </div>
            {value.note && (
              <Tooltip title={value?.note} color={theme?.primary} trigger='hover'>
                <div className='flex items-center gap-x-[5px]'>
                  <PiNotePencil className='text-[18px] text-lightGray' />
                  <h3 className='font-light text-mediumGray line-clamp-1'>{value.note}</h3>
                </div>
              </Tooltip>
            )}
            {value?.requestProductHistories && value?.requestProductHistories?.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {value?.requestProductHistories &&
                      value?.requestProductHistories?.length > 0 &&
                      value?.requestProductHistories.map((item: HistoryRequest, index: number) => (
                        <p key={item.id}>
                          Lý do làm lại (lần {(value?.requestProductHistories?.length || 0) - index}) {item?.reason}
                        </p>
                      ))}
                  </div>
                }
                color={theme?.primary}
                trigger='hover'
              >
                <div className='flex items-center gap-x-1 cursor-pointer'>
                  <PiNotePencil size={18} className='text-[18px] text-danger min-w-[18px]' />
                  <h3 className='font-light text-danger line-clamp-1'>Có yêu cầu làm lại</h3>
                </div>
              </Tooltip>
            )}
            {value?.customerName && (
              <div className='flex items-center gap-x-[5px] text-primary max-w-[200px]'>
                <AiOutlineUser size={18} className='min-w-[18px]' />
                <p className='break-words font-medium text-[12px] line-clamp-1'>{value?.customerName}</p>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: `Cần thực hiện`,
      dataIndex: 'servedQuantity',
      align: 'center',
      width: 100,
      render: (value, _record, index) => <span className='text-primary'>{value}</span>
    },
    {
      title: 'Đã thực hiện',
      dataIndex: 'completedQuantity',
      align: 'center',
      width: 100,
      render: (value, _record, index) => <span className='text-primary'>{value}</span>
    },
    ...(currentUser?.currentUserStore?.role !== RoleType.STAFF
      ? [
          {
            title: 'Tác vụ',
            dataIndex: 'actions',
            fixed: 'right' as const,
            width: 160,
            render: (_value: RequestProduct, record: ExpandedDataType) => (
              <div className='flex gap-4 justify-center'>
                <BaseButton
                  variant='outlined'
                  color='danger'
                  onClick={() => {
                    setModalAction(true);
                    setActionType('cancel');
                    setRequestProducts([record]);
                  }}
                >
                  <IoClose className='text-[24px] text-danger' />
                </BaseButton>
                <BaseButton
                  variant='outlined'
                  onClick={() => {
                    setModalAction(true);
                    setActionType('complete');
                    setRequestProducts([record]);
                  }}
                >
                  <MdCheck className='text-[24px]' />
                </BaseButton>
              </div>
            )
          }
        ]
      : [])
  ];

  const expandedRowRender = (record: DataType) => (
    <div>
      {record?.expandDataSourceList?.map((group, index) => {
        // const dynamicColumns = expandColumns.map((col, index) => ({
        //   ...col,
        //   title:
        //     col?.title === 'title' ? (
        //       <p className='text-sm font-semibold  w-[270px]'>{`Yêu cầu ${index + 1}`}</p>
        //     ) : (
        //       col.title
        //     )
        // }));
        // const servedAndCompletedQuantity = group.reduce(
        //   (acc, request) => {
        //     acc.quantity += request.quantity;
        //     acc.completedQuantity += request.completedQuantity;
        //     acc.servedQuantity += request.servedQuantity;
        //     return acc;
        //   },
        //   { quantity: 0, completedQuantity: 0, servedQuantity: 0 }
        // );
        // const newGroup = [
        //   {
        //     key: `group-${index}`,
        //     productName: 'Tất cả yêu cầu',
        //     quantity: servedAndCompletedQuantity.quantity,
        //     servedQuantity: servedAndCompletedQuantity.servedQuantity,
        //     completedQuantity: servedAndCompletedQuantity.completedQuantity,
        //     note: null,
        //     reason: null,
        //     confirmedAt: '',
        //     customerName: '',
        //     table: '',
        //     zone: '',
        //     requestProductHistories: [],
        //     group: group
        //   },
        //   ...group
        // ];
        return (
          <div key={index} className='mb-4 border rounded-[10px] overflow-hidden'>
            <Table<ExpandedDataType>
              // columns={dynamicColumns}
              columns={expandColumns}
              dataSource={group}
              pagination={false}
              className='custom-table custom-table-th text-center'
              rowClassName={() => ''}
              locale={{ emptyText: <NoData /> }}
            />
          </div>
        );
      })}
    </div>
  );

  const handleChangeValue = (index: number, value: number) => {
    const newList = [...updatedList];
    const item = newList[index];
    const newServedQuantity = (item.quantity || 0) - value;
    newList[index] = { ...item, completedQuantity: newServedQuantity };
    setUpdatedList(newList);
  };

  useEffect(() => {
    setUpdatedList(requestProducts);
  }, [requestProducts]);

  const handleConfirmOrReject = async (isComplete: boolean) => {
    await updateCompleteOrCancel(
      updatedList?.map((item) => ({
        id: item?.key,
        quantity: item?.quantity - item?.completedQuantity
      })),
      isComplete
    );
    setModalAction(false);
  };

  // Socket listeners
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: (newRequest: any) => {
          if (currentUser?.kitchen?.id !== newRequest?.requestProducts[0]?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
    [filters]
  );
  const { collapsed } = useLayoutStore();

  const collapsedCss = () => {
    if (collapsed) return 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3';
    return 'md:grid-cols-2 lg:grid-cols-2';
  };
  return (
    <div className='pb-10'>
      <div className='hidden xl:block overflow-y-auto'>
        <Table<DataType>
          columns={columns}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <div
                  className='border-[0.5px] border-primary w-6 flex justify-center items-center h-6 rounded-[10px] cursor-pointer'
                  onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => onExpand(record, e)}
                >
                  <FiMinus className='text-primary' />
                </div>
              ) : (
                <div
                  className='border-[0.5px] border-primary w-6 flex justify-center items-center h-6 rounded-[10px] cursor-pointer'
                  onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    onExpand(record, e);
                  }}
                >
                  <FiPlus className='text-primary' />
                </div>
              )
          }}
          dataSource={dataRequestsProductAll}
          scroll={{ y: '75vh' }}
          bordered={false}
          loading={isLoading}
          pagination={false}
          className='custom-table border-dashed hidden-scroll-table'
          locale={{ emptyText: <NoData /> }}
        />
      </div>
      <div className='block xl:hidden overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
        {!dataRequestsProductAll?.length && <NoData />}
        <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
          {!!dataRequestsProductAll?.length &&
            dataRequestsProductAll?.map((item: DataType) => {
              return isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div
                  key={item.key}
                  onClick={() => {
                    navigate(`product/${item.key}/${filters?.zoneId}/${filters?.tableId}`);
                  }}
                >
                  <CardRequestProductTable
                    productName={item?.productName}
                    quantityNeed={item?.servedQuantity}
                    quantityAvailble={item?.completedQuantity}
                    thumbnail={generateImageURL(item?.product?.thumbnail)}
                    title='Hoàn thành'
                    permission={currentUser?.currentUserStore?.role !== RoleType.STAFF}
                    onConfirm={() => {
                      const productsForTable = item?.expandDataSourceList?.flat() || [];
                      setActionType('complete');
                      setRequestProducts(productsForTable);
                      setModalAction(true);
                    }}
                    onCancel={() => {
                      const productsForTable = item?.expandDataSourceList?.flat() || [];
                      setActionType('cancel');
                      setRequestProducts(productsForTable);
                      setModalAction(true);
                    }}
                    isPrintEnabled={currentUser?.kitchen?.isPrintEnabled}
                    onPrint={() => {
                      setValuePrint(item);
                      setTimeout(() => handlePrint(), 0);
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>
      <div className='hidden'>
        <div className='w-full' ref={contentRef}>
          <KitchenTickets data={valuePrint} type={'all'} printType='single' />
        </div>
      </div>
      <ActionModal
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
      />
    </div>
  );
}
