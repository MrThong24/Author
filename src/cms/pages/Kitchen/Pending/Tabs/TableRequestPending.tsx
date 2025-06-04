import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Collapse, Drawer, Dropdown, Empty, Skeleton, Tag, Tooltip } from 'antd';
import BaseButton from 'src/shared/components/Buttons/Button';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { HistoryRequest, TRequest, TRequestAllTable, TRequestProduct } from 'src/types/request.type';
import { RequestReMadePayload, requestReMadeSchema } from 'src/validate/requestTransferredSchema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ActionModal from '../../components/ActionModal';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import { SocketEnum } from 'src/shared/common/enum';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import useLayoutStore from 'src/store/layoutStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import NoData from 'src/cms/components/NoData/NoData';
import RequestCardPending from '../components/CardRequestPending';
import { IoChevronBackOutline } from 'react-icons/io5';
import { LuHandPlatter } from 'react-icons/lu';
import { useTheme } from 'src/provider/ThemeContext';
import { PiNotePencil } from 'react-icons/pi';

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
  key: React.Key | string | number;
  name: string;
  zoneId: string;
  tableId: string;
  completedQuantity: number;
  servedQuantity: number;
  expandDataSourceList?: {
    note?: string;
    confirmedAt?: string;
    customerName: string | null;
    list: ExpandedDataType[];
  }[];
}

export default function TableRequestPending({ filters }: { filters: FilterKitchen }) {
  const { dataTableComplete, isLoading, updateServeOrRemade, setTableComplete } = useRequestProductStore();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [requestProducts, setRequestProducts] = useState<any[]>([]);
  const [dataDrawer, setDataDrawer] = useState<any | null>(null);
  const [updatedList, setUpdatedList] = useState<any[]>([]);
  const [actionType, setActionType] = useState<'remade' | 'serve'>('serve');
  const { theme } = useTheme();

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm<RequestReMadePayload>({
    resolver: yupResolver(requestReMadeSchema),
    defaultValues: {
      reasons: []
    }
  });

  const dataRequestsProductAllTable = dataTableComplete?.map((item: TRequestAllTable): DataType => {
    let servedAndCompletedQuantity = item.requests.reduce(
      (acc, request) => {
        request.requestProducts.forEach((product) => {
          acc.quantity += product.quantity;
          acc.completedQuantity += product.completedQuantity;
          acc.servedQuantity += product.servedQuantity;
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
            servedQuantity: requestProduct?.servedQuantity,
            requestProductHistories: requestProduct?.requestProductHistories
          }))
        })
      ),
      completedQuantity: servedAndCompletedQuantity.completedQuantity,
      servedQuantity: servedAndCompletedQuantity.servedQuantity
    };
  });

  const handleChangeValue = (index: number, value: number) => {
    const newList = [...updatedList];
    const item = newList[index];
    const newServedQuantity = (item.completedQuantity || 0) - value;
    newList[index] = { ...item, servedQuantity: newServedQuantity };
    setUpdatedList(newList);
  };

  useEffect(() => {
    setUpdatedList(requestProducts);
  }, [requestProducts]);

  const handleServeOrRemade = async (isServe: boolean) => {
    const reasonValue = getValues('reasons'); // Lấy giá trị của reason
    await updateServeOrRemade(
      updatedList?.map((item, index) => ({
        id: item?.key,
        quantity: item.completedQuantity - item?.servedQuantity,
        reason: !isServe ? reasonValue?.[index] : undefined
      })),
      isServe
    );
    setUpdatedList([]);
    setOpenModal(false);
    setOpenDrawer(false);
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
    price: requestProduct.price,
    status: requestProduct.status,
    requestProductHistories: requestProduct.requestProductHistories,
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
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: any) => {
          setTableComplete((prevTables) => {
            const updatedTables = prevTables
              .map((table) => ({
                ...table,
                requests: table.requests
                  .map((request) => ({
                    ...request,
                    requestProducts: request.requestProducts.filter((product) => product.id !== requestProduct.id)
                  }))
                  .filter((request) => request.requestProducts.length > 0)
              }))
              .filter((table) => table.requests.length > 0);

            return { data: updatedTables, total: updatedTables.length };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: any) => {
          setTableComplete((prevTables) => {
            const tableId = requestProduct.request.table.id;
            const requestId = requestProduct.request.id;
            const existingTable = prevTables.find((table) => table.id === tableId);
            if (
              requestProduct.completedQuantity === 0 ||
              requestProduct.completedQuantity - requestProduct.servedQuantity === 0
            ) {
              const updatedTables = prevTables
                .map((table) => ({
                  ...table,
                  requests: table.requests
                    .map((request) => ({
                      ...request,
                      requestProducts: request.requestProducts.filter((product) => product.id !== requestProduct.id)
                    }))
                    .filter((request) => request.requestProducts.length > 0)
                }))
                .filter((table) => table.requests.length > 0);

              return { data: updatedTables, total: updatedTables.length };
            }
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

                    return {
                      ...request,
                      requestProducts: updatedRequestProducts
                    };
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
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: any) => {
          if (requestProduct.completedQuantity === requestProduct.servedQuantity) return;
          setTableComplete((prevTables) => {
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
                    return {
                      ...request,
                      requestProducts: updatedRequestProducts
                    };
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
        event: SocketEnum.REQUEST_PRODUCT_SERVED,
        callback: (requestProduct: any) => {
          setTableComplete((prevTables) => {
            // Nếu số lượng hoàn thành là 0 thì xóa sản phẩm khỏi danh sách
            const updatedTables = prevTables
              .map((table) => ({
                ...table,
                requests: table.requests
                  .map((request) => ({
                    ...request,
                    requestProducts: request.requestProducts.filter((product) => product.id !== requestProduct.id)
                  }))
                  .filter((request) => request.requestProducts.length > 0)
              }))
              .filter((table) => table.requests.length > 0);

            return { data: updatedTables, total: updatedTables.length };
          });
        }
      }
    ],
    [filters]
  );

  useEffect(() => {
    if (openModal) {
      reset({ reasons: [] });
    }
  }, [openModal]);

  const { collapsed } = useLayoutStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const collapsedCss = () => {
    if (!isMobile && collapsed) return 'md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 ';
    return 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4';
  };

  return (
    <div className='overflow-y-scroll max-h-[calc(100vh-140px)] mbsm:max-h-[calc(100vh-110px)] md:max-h-[calc(100vh-90px)] xl:max-h-[calc(100vh-160px)]'>
      {!dataRequestsProductAllTable?.length && <NoData description='Không có yêu cầu nào' />}
      {!!dataRequestsProductAllTable?.length &&
        dataRequestsProductAllTable?.map((item: DataType) => (
          <Collapse
            key={item?.key}
            expandIconPosition='end'
            className='[&_.ant-collapse-header]:!text-primary !bg-primary-50 [&_.ant-collapse-header]:!text-base [&_.ant-collapse-header]:!font-semibold [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-header]:!rounded-t-md shadow-sm mb-4'
            defaultActiveKey={[`${item?.key}`]}
            items={[
              {
                key: item?.key as string,
                label: (
                  <div className='flex items-center justify-between flex-row gap-2 w-full '>
                    <h2 className='font-medium'>{item?.name}</h2>
                    <h2 className='font-medium text-gray-600 mr-2'>Số lượng {item?.expandDataSourceList?.length}</h2>
                  </div>
                ),
                children: (
                  <div className={`grid grid-cols-1 gap-4 mb-4 ${collapsedCss()}}`}>
                    {item?.expandDataSourceList?.map((subItem, index) => {
                      return (
                        <RequestCardPending
                          key={index}
                          item={item}
                          subItem={subItem}
                          onRemade={() => {
                            setActionType('remade');
                            setRequestProducts(subItem?.list);
                            setOpenModal(true);
                          }}
                          onServe={() => {
                            setActionType('serve');
                            setRequestProducts(subItem?.list);
                            setOpenModal(true);
                          }}
                          onViewDetail={() => {
                            setOpenDrawer(true);
                            setDataDrawer({ ...subItem, name: item?.name, tableId: item?.tableId });
                          }}
                        />
                      );
                    })}
                  </div>
                )
              }
            ]}
          />
        ))}
      <Drawer
        zIndex={999}
        title={
          <div className='flex items-center justify-between cursor-pointer' onClick={() => setOpenDrawer(false)}>
            <p className='text-lg'>Chi tiết yêu cầu chờ phục vụ</p>
          </div>
        }
        placement='right'
        width={500}
        closable={true}
        onClose={() => setOpenDrawer(false)}
        footer={
          <div className='flex flex-1 justify-between gap-4'>
            <BaseButton
              variant='text'
              className='text-[16px] font-medium py-5 flex-1 bg-[#F89734] hover:!bg-[#F89734]/80  !text-white'
              onClick={() => {
                setActionType('remade');
                setRequestProducts(dataDrawer?.list as []);
                setOpenModal(true);
              }}
              loading={false}
            >
              Làm lại
            </BaseButton>
            <BaseButton
              className='text-[16px] font-medium py-5 bg-primary flex-1'
              onClick={() => {
                setActionType('serve');
                setRequestProducts(dataDrawer?.list as []);
                setOpenModal(true);
              }}
              loading={false}
            >
              Phục vụ
            </BaseButton>
          </div>
        }
        closeIcon={
          <BaseButton
            variant='text'
            className='flex items-center justify-center w-2 bg-transparent'
            icon={<IoChevronBackOutline className=' !text-[#151d2d]' size={26} />}
          ></BaseButton>
        }
        open={openDrawer}
      >
        <div className='flex justify-between items-center pb-3 space-x-2'>
          <div className='flex items-center space-x-2 overflow-hidden max-w-[75%]'>
            <LuHandPlatter className=' min-w-[30px] text-primary' size={30} />
            <div className='overflow-hidden'>
              <Tooltip title={dataDrawer?.name} placement='top' color={theme?.primary}>
                <h3 className='font-semibold text-md line-clamp-2 break-words'>{dataDrawer?.name}</h3>
              </Tooltip>
              <Tooltip title={dataDrawer?.customerName} placement='top' color={theme?.primary}>
                <p className='text-sm text-gray-700 font-medium line-clamp-2 break-words'>{dataDrawer?.customerName}</p>
              </Tooltip>
            </div>
          </div>
          <Tag color='orange' className='flex-shrink-0'>
            {dataDrawer?.confirmedAt}
          </Tag>
        </div>
        <h2 className='text-[16px] font-medium my-2'>Danh sách món chờ phục vụ</h2>
        {dataDrawer?.list?.map((item: ExpandedDataType) => (
          <div
            className='px-3 py-2 rounded-[8px] border border-[#F4F4F5] bg-white mb-4 flex justify-between items-center gap-2'
            style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
          >
            <div>
              <h2 className='text-[16px] text-black font-medium mb-2'>{item?.name}</h2>
              {item?.note && item?.note.trim() !== '' && (
                <div className='flex gap-2 items-center text-[#595959] w-fit'>
                  <PiNotePencil size={18} className='text-[16px] text-gray-500 min-w-[16px]' />
                  <p className='font-light text-gray-500 text-sm line-clamp-1'>{item?.note}</p>
                </div>
              )}
            </div>
            <span className='text-xs text-white bg-primary px-2 py-[2px] rounded font-medium'>
              {item?.completedQuantity - item?.servedQuantity}
            </span>
          </div>
        ))}
      </Drawer>
      <ActionModal
        isOpen={openModal}
        onClose={() => {
          reset({ reasons: [] });
          setOpenModal(false);
          setRequestProducts([]);
          setUpdatedList([]);
        }}
        handleChangeValue={handleChangeValue}
        actionType={actionType}
        onConfirm={handleSubmit(() => handleServeOrRemade(actionType === 'serve' ? true : false))}
        data={updatedList}
        dataTemp={requestProducts}
        control={control}
        errors={errors}
        loading={isLoading}
      />
    </div>
  );
}
