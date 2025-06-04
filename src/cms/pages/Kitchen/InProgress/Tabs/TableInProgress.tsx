import React, { useEffect, useRef, useState } from 'react';
import { Empty, Skeleton, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { IoClose } from 'react-icons/io5';
import { MdCheck } from 'react-icons/md';
import BaseButton from 'src/shared/components/Buttons/Button';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import {
  HistoryRequest,
  TRequest,
  TRequestAllTable,
  TRequestProduct,
  Request,
  RequestProduct
} from 'src/types/request.type';
import ActionModal from '../../components/ActionModal';
import CardRequestTable from '../../components/CardRequestTable';
import { RoleType } from 'src/shared/common/enum';
import useAuthStore from 'src/store/authStore';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import { SocketEnum } from 'src/shared/common/enum';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import { useNavigate } from 'react-router-dom';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlinePrinter, AiOutlineUser } from 'react-icons/ai';
import dayjs from 'dayjs';
import { useTheme } from 'src/provider/ThemeContext';
import { PiNotePencil } from 'react-icons/pi';
import { FiMinus, FiPlus } from 'react-icons/fi';
import useLayoutStore from 'src/store/layoutStore';
import NoData from 'src/cms/components/NoData/NoData';
import { useReactToPrint } from 'react-to-print';
import KitchenTickets from '../components/KitchenTickets';

interface ExpandedDataType {
  key: React.Key;
  name: string;
  note: string | null;
  reason: string | null;
  quantity: number;
  completedQuantity: number;
  servedQuantity: number;
  customerName: string;
  group?: ExpandedDataType[];
  requestProductHistories?: HistoryRequest[];
}

interface DataType {
  key: React.Key;
  zoneId: string;
  tableId: string;
  name: string;
  completedQuantity: number;
  servedQuantity: number;
  expandDataSourceList?: {
    note?: string;
    confirmedAt?: string;
    customerName: string | null;
    list: ExpandedDataType[];
  }[];
}

export default function KitchenTable({ filters }: { filters: FilterKitchen }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { dataTableInProgress, isLoading, updateCompleteOrCancel, setTableInprogress } = useRequestProductStore();
  const { currentUser } = useAuthStore();
  const [modalAction, setModalAction] = useState<boolean>(false);
  const [requestProducts, setRequestProducts] = useState<any[]>([]);
  const [valuePrint, setValuePrint] = useState<any>({});
  const [updatedList, setUpdatedList] = useState<any[]>([]);
  const [actionType, setActionType] = useState<'complete' | 'cancel'>('complete');
  const dataRequestsProductAllTable = dataTableInProgress?.map((item: TRequestAllTable): DataType => {
    let servedAndCompletedQuantity = item.requests.reduce(
      (acc, request) => {
        request.requestProducts.forEach((product) => {
          acc.quantity += product.quantity;
          acc.completedQuantity += product.completedQuantity;
          acc.servedQuantity += product.quantity;
        });
        return acc;
      },
      { quantity: 0, completedQuantity: 0, servedQuantity: 0 }
    );
    return {
      key: item.id,
      zoneId: item?.zone?.id,
      tableId: item.id,
      name: `${item?.zone?.name} - ${item?.name}`,
      expandDataSourceList: item?.requests?.map(
        (
          itemRequests: TRequest
        ): { note?: string; confirmedAt: string; customerName: string; list: ExpandedDataType[] } => ({
          note: itemRequests?.note || '',
          confirmedAt: capitalizeFirstLetter(dayjs(itemRequests?.confirmedAt).fromNow()).replace('tới', 'trước'),
          customerName: itemRequests?.sessionCustomer?.customer?.name || '',
          list: itemRequests?.requestProducts?.map((requestProduct: TRequestProduct) => ({
            key: requestProduct.id,
            note: requestProduct?.note || '',
            reason: requestProduct?.reason || '',
            name: requestProduct?.productName,
            customerName: itemRequests?.sessionCustomer?.customer?.name || '',
            quantity: requestProduct?.quantity,
            completedQuantity: requestProduct?.completedQuantity,
            servedQuantity: requestProduct?.quantity,
            requestProductHistories: requestProduct?.requestProductHistories
          }))
        })
      ),
      completedQuantity: servedAndCompletedQuantity.completedQuantity,
      servedQuantity: servedAndCompletedQuantity.servedQuantity
    };
  });
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

  const columns: TableColumnsType<DataType> = [
    {
      title: 'Bàn',
      dataIndex: 'name',
      align: 'left',
      width: 250,
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
                    const productsForTable = record?.expandDataSourceList?.map((item) => item?.list).flat() || [];
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
                    const productsForTable = record?.expandDataSourceList?.map((item) => item?.list).flat() || [];
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
                      setTimeout(() => handlePrintMultiTable(), 0);
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
      title: '',
      width: 280,
      render: (value: ExpandedDataType) => {
        return (
          <div>
            <span className={`text-base font-semibold`}>{value?.name}</span>
            {value?.note && (
              <Tooltip title={value?.note} color={theme?.primary} trigger='hover'>
                <div className='flex gap-2 items-center text-[#595959]'>
                  <FaRegEdit size={16} className='min-w-4' />
                  <p className='font-normal text-sm leading-[20px] line-clamp-1'>{value?.note}</p>
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
          </div>
        );
      }
    },
    {
      title: `Cần thực hiện`,
      dataIndex: 'servedQuantity',
      width: 100,
      align: 'center',
      render: (value, _record, index) => <span className='text-primary'>{value}</span>
    },
    {
      title: 'Đã thực hiện',
      dataIndex: 'completedQuantity',
      width: 100,
      align: 'center',
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
                    // Check if it's a summary row by checking the key format
                    if (typeof record.key === 'string' && record.key.startsWith('summary-')) {
                      setRequestProducts(record?.group as ExpandedDataType[]);
                    } else if (record.group) {
                      setRequestProducts(record.group);
                    } else {
                      setRequestProducts([record]);
                    }
                  }}
                >
                  <IoClose className='text-[24px] text-danger' />
                </BaseButton>
                <BaseButton
                  variant='outlined'
                  onClick={() => {
                    setModalAction(true);
                    setActionType('complete');
                    if (typeof record.key === 'string' && record.key.startsWith('summary-')) {
                      setRequestProducts(record?.group as ExpandedDataType[]);
                    } else if (record.group) {
                      setRequestProducts(record.group);
                    } else {
                      setRequestProducts([record]);
                    }
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
        // Tính tổng số lượng cần phục vụ và đã phục vụ
        const totalCompletedQuantity = group.list.reduce((sum, item) => sum + (item.completedQuantity || 0), 0);
        const totalServedQuantity = group.list.reduce((sum, item) => sum + (item.servedQuantity || 0), 0);

        // In the expandedRowRender function:
        const summaryRow: ExpandedDataType = {
          key: `${index}`,
          name: (
            <div className='flex gap-x-[11px] w-[270px]'>
              <p className='text-sm font-semibold'>Yêu cầu {index + 1}</p>
              <span className='text-green-500 font-medium text-[10px] inline-block rounded-[8px] bg-green-500/20 px-2'>
                {group?.confirmedAt}
              </span>
            </div>
          ) as any,
          note: null,
          reason: null,
          quantity: 0,
          completedQuantity: totalCompletedQuantity,
          servedQuantity: totalServedQuantity,
          customerName: '',
          group: group.list
        };

        // Thêm hàng tổng vào cuối danh sách
        const dataSourceWithSummary = [summaryRow, ...group.list];

        return (
          <div key={index} className='mb-4 border rounded-[10px] overflow-hidden'>
            <Table<ExpandedDataType>
              columns={expandColumns}
              dataSource={dataSourceWithSummary}
              pagination={false}
              className={`custom-table-th custom-table-footer`}
              footer={() => (
                <div className='flex justify-between items-center'>
                  {group?.note ? (
                    <Tooltip title={group?.note} color={theme?.primary} trigger='hover'>
                      <div className='flex gap-2 items-center text-primary'>
                        <FaRegEdit size={16} className='min-w-4' />
                        <p className='font-normal text-sm leading-[20px] line-clamp-1'>{group?.note}</p>
                      </div>
                    </Tooltip>
                  ) : null}
                  <div className='flex gap-1 text-primary items-center text-sm font-normal ml-auto'>
                    <AiOutlineUser size={18} /> {group?.customerName}
                  </div>
                </div>
              )}
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
    requestProductHistories: requestProduct.requestProductHistories,
    price: requestProduct.price,
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

  // Socket listeners
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_NOTIFY_TRANSFERRED,
        callback: (newRequest: any) => {
          if (currentUser?.kitchen?.id !== newRequest?.requestProducts[0]?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
          if (currentUser?.kitchen?.id !== requestProduct?.kitchenId) return;
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
  const { collapsed } = useLayoutStore();

  const collapsedCss = () => {
    if (collapsed) return 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3';
    return 'md:grid-cols-2 lg:grid-cols-2';
  };
  return (
    <div>
      <div
        className={`hidden xl:block h-full overflow-y-auto ${currentUser?.currentUserStore?.role === RoleType.STAFF && 'showColumnStaff'}`}
      >
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
          dataSource={dataRequestsProductAllTable}
          scroll={{ y: '75vh' }}
          bordered={false}
          pagination={false}
          loading={isLoading}
          className='custom-table border-dashed hidden-scroll-table'
          locale={{ emptyText: <NoData /> }}
        />
      </div>
      <div className='block xl:hidden overflow-y-scroll h-full max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
        {!dataRequestsProductAllTable?.length && <NoData />}
        <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
          {!!dataRequestsProductAllTable?.length &&
            dataRequestsProductAllTable?.map((item: DataType) => {
              return isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div
                  key={item?.key}
                  onClick={() => {
                    navigate(`table/${item?.zoneId}/${item?.tableId}`);
                  }}
                >
                  <CardRequestTable
                    table={item?.name}
                    quantityNeed={item?.servedQuantity}
                    quantityAvailable={item.completedQuantity}
                    title='Hoàn thành'
                    permission={currentUser?.currentUserStore?.role !== RoleType.STAFF}
                    onConfirm={() => {
                      const productsForTable = item?.expandDataSourceList?.map((i) => i?.list).flat() || [];
                      setActionType('complete');
                      setRequestProducts(productsForTable);
                      setModalAction(true);
                    }}
                    onCancel={() => {
                      const productsForTable = item?.expandDataSourceList?.map((i) => i?.list).flat() || [];
                      setActionType('cancel');
                      setRequestProducts(productsForTable);
                      setModalAction(true);
                    }}
                    isPrintEnabled={currentUser?.kitchen?.isPrintEnabled}
                    onPrint={() => {
                      setValuePrint(item);
                      setTimeout(() => handlePrintMultiTable(), 0);
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>
      <div className='hidden'>
        <div ref={multiTableRef} className='w-full'>
          <div className='flex flex-col gap-4 w-full'>
            {!!valuePrint?.expandDataSourceList?.length &&
              valuePrint?.expandDataSourceList?.map((table: any, index: number) => {
                return (
                  <div key={table.id}>
                    <div className='print-content page-break-after'>
                      <KitchenTickets
                        key={table.id}
                        data={table}
                        type='table'
                        printType='single'
                        index={index}
                        tableName={valuePrint?.name}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
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
