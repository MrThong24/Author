import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { TRequest, TRequestProduct } from 'src/types/request.type';
import { IoMdNotificationsOutline } from 'react-icons/io';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  RequestReMadePayload,
  requestReMadeSchema,
  RequestTransferredPayload,
  requestTransferredSchema
} from 'src/validate/requestTransferredSchema';
import { SocketEnum } from 'src/shared/common/enum';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import { LoadingFullPage } from 'src/shared/components/Loading/LoadingFullPage';
import { Dropdown, Empty, Skeleton } from 'antd';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FaRegCircleCheck } from 'react-icons/fa6';
import ActionModal from '../../components/ActionModal';
import { AiOutlineReload } from 'react-icons/ai';
import { SlClose } from 'react-icons/sl';
import useLayoutStore from 'src/store/layoutStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import CardRequestProductNew from '../../components/CardRequestProductNew';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import ChangeQuantityModal from '../../components/ChangeQuantityModal';

export default function TableRequestPendingDetail({ filters }: { filters?: FilterKitchen }) {
  const { tableId, zoneId } = useParams();
  const navigate = useNavigate();
  const { fetchTableComplete, dataTableComplete, isLoading, updateServeOrRemade, setTableComplete } =
    useRequestProductStore();
  const [actionType, setActionType] = useState<'serve' | 'remade'>('remade');
  const [modalServeOrRemade, setModalServeOrRemade] = useState<boolean>(false);
  const [valueRow, setValueRow] = useState<TRequestProduct>();
  const [valueChange, setValueChange] = useState<number>(0);
  const [modalAction, setModalAction] = useState<boolean>(false);
  const [requestProducts, setRequestProducts] = useState<any[]>([]);
  const [updatedList, setUpdatedList] = useState<any[]>([]);
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors }
  } = useForm<RequestTransferredPayload>({
    resolver: yupResolver(requestTransferredSchema),
    context: { isRemade: actionType === 'remade' }
  });
  const { collapsed } = useLayoutStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const {
    control: controlReasons,
    handleSubmit: handleSubmitWithReasons,
    getValues: getValuesReasons,
    // setValue: setValueReasons,
    reset: resetReasons,
    formState: { errors: errorsReasons }
  } = useForm<RequestReMadePayload>({
    resolver: yupResolver(requestReMadeSchema),
    defaultValues: {
      reasons: []
    }
  });

  useEffect(() => {
    fetchTableComplete({ tableId, zoneId });
  }, [zoneId, tableId]);

  const handleServeOrRemade = async (isServe: boolean) => {
    const reasonValue = getValues('reason'); // Lấy giá trị của reason
    await updateServeOrRemade(
      [
        {
          quantity: valueChange,
          id: valueRow?.id as string,
          reason: !isServe ? reasonValue : undefined // Chỉ gửi lý do khi làm lại món
        }
      ],
      isServe
    );
    reset();
    setModalServeOrRemade(false);
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

  const data = useMemo(() => {
    if (!dataTableComplete || dataTableComplete.length === 0) return [];

    return dataTableComplete[0]?.requests
      .map((itemRequest: TRequest) => ({
        confirmedAt: capitalizeFirstLetter(dayjs(itemRequest?.confirmedAt).fromNow()).replace('tới', 'trước'),
        list: itemRequest.requestProducts
      }))
      .flat();
  }, [dataTableComplete, filters]);

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
  const handleChangeValue = (index: number, value: number) => {
    const newList = [...updatedList];
    const item = newList[index];
    const newServedQuantity = (item.completedQuantity || 0) - value;
    newList[index] = { ...item, servedQuantity: newServedQuantity };
    setUpdatedList(newList);
  };
  const handleServeOrRemadeRequests = async (isServe: boolean) => {
    const reasonValue = getValuesReasons('reasons'); // Lấy giá trị của reason
    setModalAction(false);
    await updateServeOrRemade(
      updatedList?.map((item, index) => ({
        id: item?.id,
        quantity: item.completedQuantity - item?.servedQuantity,
        reason: !isServe ? reasonValue?.[index] : undefined
      })),
      isServe
    );
  };

  const collapsedCss = () => {
    if (!isMobile && collapsed) return 'md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 ';
    return 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4';
  };

  useEffect(() => {
    if (modalAction) {
      resetReasons({ reasons: [] });
    }
  }, [modalAction]);
  return (
    <DetailHeader title='Yêu cầu chờ phục vụ' handleBack={() => navigate(-1)}>
      <div className='overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
        {isLoading && <Skeleton active paragraph={{ rows: 3 }} />}
        {!data?.length && <NoData description='Không có yêu cầu nào' />}
        <div>
          <div className='block overflow-y-scroll max-h-[calc(100vh-144px)] mbsm:max-h-[calc(100vh-96px)]'>
            <div className='flex flex-col gap-4'>
              {!isLoading &&
                !!data?.length &&
                data?.map((items: { confirmedAt: string; list: TRequestProduct[] }, groupIndex: number) => (
                  <div key={groupIndex} className='w-full mb-4'>
                    <div className='flex justify-start items-center mb-[15px]'>
                      <p className='text-base text-primary font-semibold'>Yêu cầu {groupIndex + 1}</p>
                      <div className='flex items-ce nter justify-end gap-x-[10px] w-[160px]'>
                        <div
                          onClick={() => {
                            setActionType('remade');
                            setRequestProducts(items.list);
                            setUpdatedList(items.list);
                            setModalAction(true);
                          }}
                          className={`shadow-md w-[40px] h-[30px] rounded-md flex justify-center items-center bg-[#E68B2D] hover:bg-orange-400 transition-colors cursor-pointer`}
                        >
                          <AiOutlineReload size={20} color='white' />
                        </div>
                        <div
                          onClick={() => {
                            setActionType('serve');
                            setRequestProducts(items?.list);
                            setUpdatedList(items?.list);
                            setModalAction(true);
                          }}
                          className='bg-primary text-white flex items-center gap-x-[10px] px-2 rounded-[5px] py-[5px] cursor-pointer text-[12px] hover:bg-primary-400 transition-colors cursor-pointer'
                        >
                          <FaRegCircleCheck size={20} /> <span>Phục vụ</span>
                        </div>
                      </div>
                    </div>
                    <div className={`grid grid-cols-1 gap-4 ${collapsedCss()}}`}>
                      {items?.list?.map((item: TRequestProduct) => (
                        <CardRequestProductNew
                          customerName={''}
                          productName={item?.productName}
                          note={item?.note || null}
                          table={`${dataTableComplete[0]?.zone?.name} - ${dataTableComplete[0]?.name}`}
                          quantityNeed={item?.completedQuantity}
                          quantityAvailble={item?.servedQuantity}
                          reason={item?.requestProductHistories || []}
                          thumbnail={generateImageURL(item?.product?.thumbnail)}
                          permission={true}
                          title='Phục vụ'
                          time={items?.confirmedAt}
                          type='complete'
                          onConfirm={() => {
                            setActionType('serve');
                            setModalServeOrRemade(true);
                            setValueRow(item);
                            setValueChange(item?.completedQuantity - item?.servedQuantity);
                          }}
                          onCancel={() => {
                            setActionType('remade');
                            setModalServeOrRemade(true);
                            setValueRow(item);
                            setValueChange(item?.completedQuantity - item?.servedQuantity);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <ChangeQuantityModal
        type={actionType === 'serve' ? 'primary' : 'danger'}
        isOpen={modalServeOrRemade}
        onClose={() => {
          setModalServeOrRemade(false);
          reset();
        }}
        onConfirm={
          actionType === 'serve'
            ? () => handleServeOrRemade(true) // Trường hợp serve
            : handleSubmit(() => handleServeOrRemade(false)) // Trường hợp remade cần validate
        }
        icon={<IoMdNotificationsOutline className='text-[26px] text-successGreen' />}
        loading={isLoading}
        confirmLabel={actionType === 'serve' ? 'Xác nhận' : 'Làm lại'}
        buttonClassName={actionType === 'remade' ? '!bg-[#F89734]' : ''}
      >
        <div className='w-full'>
          {actionType === 'serve' && (
            <p className='text-center font-light text-[16px]'>
              Bạn muốn xác nhận <span className='font-semibold text-black'>đã</span> thực hiện món{' '}
              <span className='font-semibold text-black'>{valueRow?.productName}</span> với số lượng:
            </p>
          )}
          {actionType === 'remade' && (
            <p className='text-center font-light text-[16px]'>Bạn muốn xác nhận yêu cầu làm lại với món:</p>
          )}
          <div className='flex justify-center my-3'>
            <QuantityInput
              className='text-[16px]'
              disabled={(valueRow?.completedQuantity || 0) - (valueRow?.servedQuantity || 0) <= valueChange}
              value={valueChange}
              onChange={(value) => setValueChange(value)}
            />
          </div>
          {actionType === 'remade' && (
            <div className='mt-4'>
              <Label text='Lý do cần làm lại' validate={true} className='font-normal text-mediumGray text-[14px]' />
              <FormInput
                control={control}
                name='reason'
                type='textarea'
                disabled={false}
                placeholder='Nhập nội dung'
                errors={errors}
                size='large'
                className='text-[14px]'
              />
            </div>
          )}
        </div>
      </ChangeQuantityModal>
      <ActionModal
        isOpen={modalAction}
        onClose={() => {
          resetReasons({ reasons: [] });
          setModalAction(false);
          setRequestProducts([]);
          setUpdatedList([]);
        }}
        handleChangeValue={handleChangeValue}
        actionType={actionType}
        onConfirm={handleSubmitWithReasons(() => handleServeOrRemadeRequests(actionType === 'serve' ? true : false))}
        data={updatedList}
        dataTemp={requestProducts}
        control={controlReasons}
        errors={errorsReasons}
      />
    </DetailHeader>
  );
}
