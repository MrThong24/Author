import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useOrderStore from 'src/store/useOrderStore';
import { useEffect, useState } from 'react';
import { formatCurrency, formatDate } from 'src/shared/utils/utils';
import { Modal, Spin, Tag } from 'antd';
import { Order } from 'src/types/order.type';
import { OrderStatus } from 'src/shared/common/enum';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { useTheme } from 'src/provider/ThemeContext';
import useMediaQuery from 'src/hooks/useMediaQuery';
import OrderEInvoiceDetails from '../../components/OrderEInvoiceDetails';
import OrderEInvoiceForm from '../../components/OrderEInvoiceForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { EInvoiceOrderPayload, eInvoiceOrderSchema } from 'src/validate/orderSchema';
import useAuthStore from 'src/store/authStore';
import useStoreStore from 'src/store/useStoreStore';
import { eInvoiceFormats, eInvoiceModes, eInvoiceTypes } from 'src/shared/common/constant';
import { CiBellOn } from 'react-icons/ci';
import BaseButton from 'src/shared/components/Buttons/Button';
import { IoEyeOutline } from 'react-icons/io5';
import { RiContractLine } from 'react-icons/ri';
import dayjs from 'dayjs';
import { EInvoiceSymbol } from 'src/types/store.type';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import { useWebView } from 'src/hooks/useWebView';

export const RequestStatusTag = (status: string) => {
  const StatusTag = ({ color, text }: { color: string; text: string }) => (
    <Tag className='gap-1 mt-1 px-2 items-center justify-center max-w-30 rounded-full flex flex-1' color={color}>
      <span className={`w-2 h-2 rounded-full bg-current`}></span>
      {text}
    </Tag>
  );

  switch (status) {
    case OrderStatus.PAID:
      return <StatusTag color='green' text='Đã thanh toán' />;
    case OrderStatus.UNPAID:
      return <StatusTag color='red' text='Chưa thanh toán' />;
  }
};

export const RequestEInvoiceStatusTag = (isCreatedEInvoice: boolean) => {
  const EInvoiceStatusTag = ({ color, text }: { color: string; text: string }) => (
    <Tag className='gap-1 mt-1 px-2 items-center justify-center max-w-30 rounded-full flex flex-1' color={color}>
      <span className={`w-2 h-2 rounded-full bg-current`}></span>
      {text}
    </Tag>
  );

  return isCreatedEInvoice ? (
    <EInvoiceStatusTag color='green' text='Đã tạo HDDT' />
  ) : (
    <EInvoiceStatusTag color='red' text='Chưa tạo HDDT' />
  );
};

export default function ManageOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    isLoading,
    detailOrder: storeDetailOrder,
    getDetailOrder,
    createOrderEInvoice,
    previewOrderEInvoice,
    isLoadingOrderEInvoicePdf
  } = useOrderStore();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [isAddEInvoiceTab, setIsAddEInvoiceTab] = useState<boolean>(false);
  const [openConfirmCreateInvoiceModal, setOpenConfirmCreateInvoiceModal] = useState<boolean>(false);
  const { currentUser } = useAuthStore();
  const { listSymbol, getListSymbols, eInvoiceConfig, getEInvoiceConfig, banks, getBanks } = useStoreStore();
  const [listFilteredSymbol, setListFilteredSymbol] = useState<EInvoiceSymbol[]>([]);

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EInvoiceOrderPayload>({
    mode: 'onChange',
    resolver: yupResolver(eInvoiceOrderSchema)
  });
  const [orderEInvoicePdf, setOrderEInvoicePdf] = useState<any>(null);
  const [showEInvoicePdf, setShowEInvoicePdf] = useState<boolean>(false);
  const { theme } = useTheme();
  const eInvoiceType = watch('eInvoiceType');
  const eInvoiceFormat = watch('eInvoiceFormat');
  const eInvoiceMode = watch('eInvoiceMode');

  useEffect(() => {
    if (!detailOrder?.isCreatedEInvoice) {
      if (eInvoiceFormat && eInvoiceMode && eInvoiceType && listSymbol) {
        const symbol = listSymbol.find(
          (item) =>
            eInvoiceType === item.lhdon.toString() && eInvoiceFormat === item.khdon && eInvoiceMode === item.hthuc
        );
        if (symbol) setValue('eInvoiceSymbol', symbol?.khhdon || '');
        else setValue('eInvoiceSymbol', '');
      } else setValue('eInvoiceSymbol', '');
    }
  }, [storeDetailOrder, currentUser, detailOrder?.isCreatedEInvoice, listSymbol, eInvoiceType, eInvoiceMode]);

  useEffect(() => {
    const filteredSymbol = listSymbol.filter(
      (item) => eInvoiceType === item.lhdon.toString() && eInvoiceFormat === item.khdon && eInvoiceMode === item.hthuc
    );
    setListFilteredSymbol(filteredSymbol);
  }, [listSymbol, eInvoiceType, eInvoiceMode, eInvoiceFormat, eInvoiceMode]);

  useEffect(() => {
    getListSymbols();
    getEInvoiceConfig();
    getBanks();
  }, []);
  useEffect(() => {
    if (!detailOrder?.isCreatedEInvoice) {
      const eInvoiceConfigData = {
        eInvoiceType: eInvoiceConfig?.eInvoiceType || eInvoiceTypes[0].value,
        eInvoiceFormat: eInvoiceConfig?.eInvoiceFormat || eInvoiceFormats[0].value,
        eInvoiceMode: eInvoiceConfig?.eInvoiceMode || eInvoiceModes[0].value,
        eInvoiceSymbol: eInvoiceConfig?.eInvoiceSymbol || ''
      };
      if (detailOrder?.isSaleInvoiceDiscount && eInvoiceConfig?.eInvoiceType === eInvoiceTypes[0].value) {
        eInvoiceConfigData.eInvoiceType = eInvoiceTypes[1].value;
        eInvoiceConfigData.eInvoiceFormat = eInvoiceFormats[0].value;
        eInvoiceConfigData.eInvoiceMode = eInvoiceModes[0].value;
        eInvoiceConfigData.eInvoiceSymbol =
          listSymbol.find(
            (item) =>
              eInvoiceTypes[1].value === item.lhdon.toString() &&
              eInvoiceFormats[0].value === item.khdon &&
              eInvoiceTypes[0].value === item.hthuc
          )?.khhdon || '';
      }
      const store = eInvoiceConfig;
      reset({
        ...eInvoiceConfigData,
        paymentMethod: detailOrder?.paymentMethod,
        vendorCompanyName: store?.name,
        vendorAddress: store?.address,
        vendorPhone: store?.phone,
        vendorEmail: store?.email,
        vendorBankName: banks?.find((bank) => bank.bin === store?.bankBin)?.name || '',
        vendorBankNumber: store?.bankNumber,
        vendorTaxCode: store?.taxCode,
        customerName: detailOrder?.customerName,
        customerPhone: detailOrder?.customerPhone
      });
    }
  }, [storeDetailOrder, currentUser, detailOrder?.isCreatedEInvoice, eInvoiceConfig, isAddEInvoiceTab]);

  const onCreateOrderEInvoice = async (data: EInvoiceOrderPayload) => {
    try {
      if (id) await createOrderEInvoice(id, data);
      navigate(`/order/${id}${location?.search}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getDetailOrder(id);
    }
  }, [id]);

  useEffect(() => {
    setIsAddEInvoiceTab(!!detailOrder?.isCreatedEInvoice);
  }, [detailOrder?.isCreatedEInvoice]);

  useEffect(() => {
    if (storeDetailOrder) {
      setDetailOrder(storeDetailOrder);
    }
  }, [storeDetailOrder]);

  useEffect(() => {
    const _detailOrder = { ...detailOrder } as Order;
    const totalAmount = detailOrder?.products?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    setDetailOrder({ ..._detailOrder, totalAmount });
  }, [detailOrder?.products]);

  const isWebView = useWebView();
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

  const handleOpenOrderEInvoicePdf = async (data: EInvoiceOrderPayload) => {
    if (!detailOrder?.id) return;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const pdfUrl = await previewOrderEInvoice(detailOrder?.id, data);
    if (isWebView) {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const dataUrl = fileReader.result;
        // Send message to React Native with download info
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({
            type: 'DOWNLOAD_FILE',
            payload: {
              url: dataUrl,
              filename: `${detailOrder?.code || 'invoice'}.pdf`,
              mimeType: 'application/pdf'
            }
          })
        );
      };

      fetch(pdfUrl)
        .then((response) => response.blob())
        .then((blob) => fileReader.readAsDataURL(blob))
        .catch((err) => console.error('Error preparing file for download:', err));
      return;
    }

    if (isMobile || isTouchDevice) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (isIOS) {
        link.download = `${detailOrder?.code}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      link.click();
    } else {
      setOrderEInvoicePdf(pdfUrl);
      setShowEInvoicePdf(true);
    }
  };

  const isMobile = useMediaQuery('(max-width: 1023px)');
  return (
    <>
      <Spin spinning={isLoading}>
        <DetailHeader
          title={
            isMobile ? (
              <div className='flex items-center justify-start gap-[10px] w-full'>
                <p className='text-black font-semibold text-[16px] min-w-[150px] line-clamp-1'>
                  Tạo hoá đơn điện tử {detailOrder?.code}
                </p>
              </div>
            ) : (
              'Tạo hoá đơn điện tử'
            )
          }
          rightElement={
            <div className='flex items-center gap-2 mb-4'>
              <div className='items-center gap-2 hidden lg:flex'>
                <BaseButton
                  override={theme.warning}
                  icon={<IoEyeOutline className='text-xl pt-1' />}
                  loading={isLoadingOrderEInvoicePdf}
                  onClick={handleSubmit(handleOpenOrderEInvoicePdf)}
                >
                  Xem trước HDDT
                </BaseButton>
                <BaseButton
                  icon={<RiContractLine className='text-xl' />}
                  onClick={() => setOpenConfirmCreateInvoiceModal(true)}
                >
                  Xác nhận
                </BaseButton>
              </div>
            </div>
          }
          handleBack={() => navigate(`/order/${id}${location?.search}`)}
        >
          <div>
            {/* desktop */}
            <fieldset className='mb-4 p-3 border border-gray-200 rounded-md hidden lg:flex'>
              <legend className='px-2'>
                <p className='text-sm mb-1 text-primary'>
                  #<span className='font-semibold'>{detailOrder?.code}</span>
                </p>
              </legend>
              <div className='flex md:flex-row flex-col justify-between w-full'>
                <div className='flex flex-col pl-2 gap-1'>
                  <p className='font-medium truncate max-w-[250px]'>
                    {detailOrder?.zoneName && `${detailOrder?.zoneName} - `}
                    {detailOrder?.tableName}
                  </p>
                  <p className='font-medium truncate max-w-[250px]'>
                    Khách hàng: <span className='font-normal'>{detailOrder?.customerName || ''}</span>
                  </p>
                </div>
                <div className='flex flex-col md:items-end items-start pl-2 justify-end gap-1 sm:mt-0'>
                  {detailOrder?.status === OrderStatus.PAID && (
                    <div className='flex flex-col md:gap-1  md:items-end items-start'>
                      <p className='text-sm'>
                        <span className='font-medium'>Nhân viên thanh toán:</span> {detailOrder?.staffName}
                      </p>
                      <p className='text-sm'>
                        <span className='font-medium'>Thời gian thanh toán:</span>{' '}
                        {formatDate(detailOrder?.paidAt, true)}
                      </p>
                    </div>
                  )}
                  <p className='text-sm text-primary'>
                    Tổng tiền thanh toán:
                    <span className='font-bold ml-1'>
                      {formatCurrencyDecimalVND((detailOrder?.totalAmount || 0) - (detailOrder?.discountAmount || 0))}{' '}
                      VNĐ{' '}
                    </span>
                  </p>
                </div>
              </div>
            </fieldset>
            {/* mobile */}
            <div className='flex sm:flex-row justify-between flex-col gap-2 lg:hidden'>
              <div className='gap-2 flex flex-col'>
                <p className='font-medium truncate max-w-[250px]'>
                  {detailOrder?.zoneName && `${detailOrder?.zoneName} - `}
                  {detailOrder?.tableName}
                </p>
                <p className='font-medium truncate max-w-[250px]'>
                  Khách hàng: <span className='font-normal'>{detailOrder?.customerName || ''}</span>
                </p>
              </div>
              {detailOrder?.status === OrderStatus.PAID && (
                <div className='gap-2 flex flex-col'>
                  <p className='text-sm font-medium'>
                    Nhân viên thanh toán: <span className='font-normal'>{detailOrder?.staffName || ''}</span>
                  </p>
                  <p className='text-sm font-medium'>
                    Thời gian thanh toán:{' '}
                    <span className='font-normal'>
                      {detailOrder?.paidAt ? dayjs(detailOrder?.paidAt).format('DD/MM/YYYY HH:MM') : ''}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className='bg-primary text-white h-10 w-full rounded-md flex items-center justify-between px-[10px] mt-[15px] lg:hidden'>
              <p>Tổng tiền thanh toán</p>
              <span className='font-bold ml-1 whitespace-nowrap'>
                {formatCurrencyDecimalVND((detailOrder?.totalAmount || 0) - (detailOrder?.discountAmount || 0))} VNĐ
              </span>
            </div>
            {/* Thông tin Tổng thành tiền và thuế */}
            {detailOrder?.isSaleInvoiceDiscount && (
              <div className='bg-primary-50 text-primary w-full rounded-md lg:hidden px-[10px] py-2'>
                <div className='flex items-center gap-2 justify-between mb-1'>
                  <p className='font-semibold'>Tổng thành tiền</p>
                  <span className='font-bold ml-1 whitespace-nowrap'>
                    {formatCurrencyDecimalVND(detailOrder?.totalAmount)} VND{' '}
                  </span>
                </div>
                <div className='flex items-center gap-2 justify-between'>
                  <p className='font-semibold'>Giảm thuế theo NQ số 174/2024/QH15</p>
                  <span className='font-bold whitespace-nowrap ml-1'>
                    {formatCurrencyDecimalVND(detailOrder?.discountAmount as number)} VND{' '}
                  </span>
                </div>
              </div>
            )}

            <div className='flex items-center gap-2 lg:hidden mt-3 mb-3'>
              <BaseButton
                className='flex-1'
                override={theme.warning}
                icon={<IoEyeOutline className='text-xl w-full' />}
                loading={isLoadingOrderEInvoicePdf}
                onClick={handleSubmit(handleOpenOrderEInvoicePdf)}
              >
                Xem trước HDDT
              </BaseButton>
              <BaseButton
                className='flex-1'
                icon={<RiContractLine className='text-xl w-full' />}
                onClick={() => setOpenConfirmCreateInvoiceModal(true)}
              >
                Xác nhận
              </BaseButton>
            </div>
          </div>
          <div>
            {detailOrder?.isCreatedEInvoice ? (
              <OrderEInvoiceDetails orderEInvoice={detailOrder?.orderEInvoice} />
            ) : (
              <OrderEInvoiceForm
                control={control}
                errors={errors}
                loading={isLoading}
                setValue={setValue}
                eInvoiceFormat={eInvoiceFormat}
                listSymbol={listFilteredSymbol}
                detailOrder={detailOrder}
                store={eInvoiceConfig || undefined}
              />
            )}
          </div>
          <ModalDelete
            isOpen={openModalDelete}
            onClose={() => setOpenModalDelete(false)}
            onConfirm={() => {}}
            loading={isLoading}
          >
            <h2>Xác nhận</h2>
          </ModalDelete>
          <ModalConfirm
            isOpen={openConfirmCreateInvoiceModal}
            onClose={() => setOpenConfirmCreateInvoiceModal(false)}
            onConfirm={handleSubmit(onCreateOrderEInvoice)}
            loading={isLoading}
            icon={<CiBellOn />}
          >
            Bạn có chắc muốn tạo hóa đơn điện tử
          </ModalConfirm>
        </DetailHeader>
      </Spin>
      <iframe
        src={orderEInvoicePdf}
        className={`w-[768px] h-[calc(100svh-100px)] fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
          !showEInvoicePdf && 'hidden'
        }`}
        title='Hóa đơn điện tử'
      ></iframe>
      {showEInvoicePdf && orderEInvoicePdf && (
        <div
          className='fixed inset-0 bg-black/50 z-[60] cursor-pointer'
          onClick={() => {
            setShowEInvoicePdf(false);
            setOrderEInvoicePdf('');
          }}
        ></div>
      )}
    </>
  );
}
