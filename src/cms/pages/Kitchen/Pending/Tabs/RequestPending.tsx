import { Empty, Skeleton } from 'antd';
import { useState } from 'react';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { IoMdNotificationsOutline } from 'react-icons/io';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import useRequestProductStore, { FilterKitchen } from 'src/store/useRequestProductStore';
import { RequestProduct } from 'src/types/request.type';
import { capitalizeFirstLetter, getUpdateRequestProductQuantity } from 'src/shared/utils/common';
import dayjs from 'dayjs';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { useForm } from 'react-hook-form';
import { RequestTransferredPayload, requestTransferredSchema } from 'src/validate/requestTransferredSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import ModalDetail from '../../components/ModalDetail';
import { useMultiSocketEvents } from 'src/shared/utils/socket';
import { SocketEnum } from 'src/shared/common/enum';
import CardRequestProductNew from '../../components/CardRequestProductNew';
import useLayoutStore from 'src/store/layoutStore';
import useMediaQuery from 'src/hooks/useMediaQuery';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import ChangeQuantityModal from '../../components/ChangeQuantityModal';

export default function RequestPending({ filters, activeTab }: { filters: FilterKitchen; activeTab: string }) {
  const { requestsProductComplete, setRequestProductComplete, isLoading, updateServeOrRemade } =
    useRequestProductStore();
  const [modalDetail, setModalDetail] = useState<boolean>(false);
  const [modalServeOrRemade, setModalServeOrRemade] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'serve' | 'remade' | null>(null);
  const [valueRow, setValueRow] = useState<RequestProduct>();
  const [valueChange, setValueChange] = useState<number>(0);
  const { collapsed } = useLayoutStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');
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

  // Socket listeners
  useMultiSocketEvents(
    [
      {
        event: SocketEnum.REQUEST_PRODUCT_REMADE,
        callback: (requestProduct: RequestProduct) => {
          if (requestProduct.completedQuantity === requestProduct.servedQuantity) {
            setRequestProductComplete((prevRequestProducts) => {
              const requestProducts = prevRequestProducts.filter(
                (requestProductComplete) => requestProductComplete.id !== requestProduct.id
              );
              return {
                data: requestProducts,
                total: requestProducts.length
              };
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_CHANGED,
        callback: (requestProduct: RequestProduct) => {
          if (requestProduct.completedQuantity === requestProduct.servedQuantity) {
            setRequestProductComplete((prevRequestProducts) => {
              const requestProducts = prevRequestProducts.filter(
                (requestProductPending) => requestProductPending.id !== requestProduct.id
              );
              return {
                data: requestProducts,
                total: requestProducts.length
              };
            });
          } else {
            setRequestProductComplete((prevRequestProducts) => {
              const foundIndex = prevRequestProducts.findIndex(
                (requestProductPending) => requestProductPending.id === requestProduct.id
              );
              if (foundIndex !== -1)
                prevRequestProducts[foundIndex] = {
                  ...prevRequestProducts[foundIndex],
                  ...getUpdateRequestProductQuantity(requestProduct)
                };
              else prevRequestProducts.push(requestProduct);
              const requestsProductCompleteSorted = prevRequestProducts.sort(
                (a: RequestProduct, b: RequestProduct) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              return {
                data: requestsProductCompleteSorted,
                total: requestsProductCompleteSorted.length
              };
            });
          }
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_COMPLETED,
        callback: (requestProduct: RequestProduct) => {
          if (requestProduct.completedQuantity === requestProduct.servedQuantity) return;
          setRequestProductComplete((prevRequestProducts) => {
            const foundIndex = prevRequestProducts.findIndex(
              (requestProductPending) => requestProductPending.id === requestProduct.id
            );
            if (foundIndex !== -1)
              prevRequestProducts[foundIndex] = {
                ...prevRequestProducts[foundIndex],
                ...getUpdateRequestProductQuantity(requestProduct)
              };
            else prevRequestProducts.push(requestProduct);
            const requestsProductCompleteSorted = prevRequestProducts.sort(
              (a: RequestProduct, b: RequestProduct) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return {
              data: requestsProductCompleteSorted,
              total: requestsProductCompleteSorted.length
            };
          });
        }
      },
      {
        event: SocketEnum.REQUEST_PRODUCT_SERVED,
        callback: (requestProduct: RequestProduct) => {
          setRequestProductComplete((prevRequestProducts) => {
            const requestProducts = prevRequestProducts.filter(
              (requestProductPending) => requestProductPending.id !== requestProduct.id
            );
            return {
              data: requestProducts,
              total: requestProducts.length
            };
          });
        }
      }
    ],
    [activeTab]
  );

  const collapsedCss = () => {
    if (!isMobile && collapsed) return 'sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-5 ';
    return 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-4';
  };
  return (
    <div>
      <div className='overflow-y-scroll max-h-[calc(100vh-140px)] mbsm:max-h-[calc(100vh-110px)] md:max-h-[calc(100vh-90px)] xl:max-h-[calc(100vh-160px)]'>
        {!requestsProductComplete?.length && <NoData description='Không có yêu cầu nào' />}
        <div className={`grid grid-cols-1 ${collapsedCss()} gap-4 mb-4`}>
          {!!requestsProductComplete?.length &&
            requestsProductComplete?.map((item: RequestProduct) => {
              return isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <div
                  key={item.id}
                  onClick={() => {
                    setModalDetail(true);
                    setValueRow(item);
                  }}
                >
                  <CardRequestProductNew
                    customerName={item?.request?.sessionCustomer?.customer?.name}
                    productName={item?.productName}
                    note={item?.note || null}
                    table={`${item?.request?.table?.zone?.name} - ${item?.request?.table?.name}`}
                    quantityNeed={item?.completedQuantity}
                    quantityAvailble={item?.servedQuantity}
                    reason={item?.requestProductHistories || []}
                    thumbnail={generateImageURL(item?.product?.thumbnail)}
                    permission={true}
                    title='Phục vụ'
                    time={dayjs(item?.request?.confirmedAt).fromNow()}
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
                </div>
              );
            })}
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
              Xác nhận <span className='font-semibold text-black'>đã</span> phục vụ món{' '}
              <span className='font-semibold text-black'>{valueRow?.productName}</span> với số lượng:
            </p>
          )}
          {actionType === 'remade' && (
            <p className='text-center font-light text-[16px]'>
              Xác nhận yêu cầu làm lại món <span className='font-semibold text-black'>{valueRow?.productName}</span> với
              số lượng:
            </p>
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
