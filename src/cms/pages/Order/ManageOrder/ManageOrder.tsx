import BaseButton from 'src/shared/components/Buttons/Button';
import DetailHeader from 'src/cms/components/Headers/DetailHeader';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useOrderStore from 'src/store/useOrderStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateSaleInvoiceDiscount, formatDate, calcTaxReduction } from 'src/shared/utils/utils';
import { Modal, notification, Spin, Switch, Table, TableColumnsType, Tabs, Tag } from 'antd';
import { Order, OrderProduct } from 'src/types/order.type';
import { OrderStatus, PaymentMethod } from 'src/shared/common/enum';
import RequestHistoryCard from '../components/RequestHistoryCard';
import TabPane from 'antd/es/tabs/TabPane';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import ModalPayment from '../components/ModalPayment';
import ModalBankTransfer from '../components/ModalBankTransfer';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import ModalNotification from 'src/cms/components/Modal/ModalNotification';
import { FaCheck } from 'react-icons/fa6';
import { InfoCircleOutlined, HistoryOutlined, PrinterOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import Bill from '../components/Bill';
import { useReactToPrint } from 'react-to-print';
import QuantityInput from 'src/cms/components/QuantityInput/QuantityInput';
import SelectProduct from '../components/SearchProduct';
import { Product } from 'src/types/product.type';
import { useTheme } from 'src/provider/ThemeContext';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { FiEdit } from 'react-icons/fi';
import dayjs from 'dayjs';
import { LiaFileInvoiceDollarSolid } from 'react-icons/lia';
import OrderEInvoiceDetails from '../components/OrderEInvoiceDetails';
import { CiBellOn } from 'react-icons/ci';
import CustomModal from 'src/shared/components/Modals/Modal';
import { formatCurrencyDecimalVND } from 'src/shared/common/format';
import { useWebView } from 'src/hooks/useWebView';
import useAuthStore from 'src/store/authStore';

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
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    isLoading,
    isLoadingOrderEInvoicePdf,
    detailOrder: storeDetailOrder,
    getDetailOrder,
    updateOrder,
    updateSaleDiscountOrder,
    payOrder,
    deleteOrder,
    generateQRCodePayment,
    checkRemainingOrderRequest,
    qrCode,
    deleteOrderEInvoice,
    getOrderEInvoicePdf
  } = useOrderStore();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [openModalDeleteOrderInvoice, setOpenModalDeleteOrderInvoice] = useState<boolean>(false);
  const [openModalPayment, setOpenModalPayment] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.BANK_TRANSFER);
  const [openBankTransferPaymentModal, setOpenBankTransferPaymentModal] = useState<boolean>(false);
  const [openConfirmPaymentModal, setOpenConfirmPaymentModal] = useState<boolean>(false);
  const [openPaymentSuccessModal, setOpenPaymentSuccessModal] = useState<boolean>(false);
  const [orderEInvoicePdf, setOrderEInvoicePdf] = useState<any>(null);
  const [showEInvoicePdf, setShowEInvoicePdf] = useState<boolean>(false);
  const [isExportEInvoice, setIsExportEInvoice] = useState<boolean>(false);
  const { currentUser } = useAuthStore();

  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Hóa đơn bán hàng'
  });

  useEffect(() => {
    if (id) {
      getDetailOrder(id);
    }
  }, [id]);

  const resetOrder = (order: Order) => {
    const products = order?.products.map((product) => ({
      ...product,
      discountAmount: order?.isSaleInvoiceDiscount
        ? calcTaxReduction(product.price * product.quantity, product.discountPercent)
        : 0
    }));
    setDetailOrder({ ...order, products: products || [] });
  };

  const updateOrderDiscount = (order: Order) => {
    const products = order?.products.map((product: OrderProduct) => ({
      ...product,
      discountAmount: order?.isSaleInvoiceDiscount
        ? calcTaxReduction(product.price * product.quantity, product.discountPercent)
        : 0
    }));
    const totalDiscountAmount = products?.reduce((sum: number, item: OrderProduct) => sum + item.discountAmount, 0);
    setDetailOrder({ ...order, discountAmount: calculateSaleInvoiceDiscount(totalDiscountAmount) });
  };

  useEffect(() => {
    if (storeDetailOrder) {
      resetOrder(storeDetailOrder);
    }
  }, [storeDetailOrder]);

  const isWebView = useWebView();
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  const handleOpenOrderEInvoicePdf = async () => {
    if (detailOrder?.isCreatedEInvoice) {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const pdfUrl = await getOrderEInvoicePdf(detailOrder?.id);
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
    }
  };

  useEffect(() => {
    const _detailOrder = { ...detailOrder } as Order;
    const totalAmount = detailOrder?.products?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    setDetailOrder({ ..._detailOrder, totalAmount });
  }, [detailOrder?.products]);

  const handleChangeProductQuantity = (index: number, value: number) => {
    const _detailOrder = JSON.parse(JSON.stringify(detailOrder));
    if (_detailOrder?.products?.[index]?.quantity) {
      _detailOrder.products[index].quantity = value;
      _detailOrder.products[index].discountAmount = calcTaxReduction(
        _detailOrder.products[index].price * value,
        _detailOrder.products[index].discountPercent
      );
    }
    updateOrderDiscount(_detailOrder);
  };

  const handleAddNewProduct = (product: Product) => {
    const _detailOrder = JSON.parse(JSON.stringify(detailOrder));
    const existingProductIndex = _detailOrder.products.findIndex((item: OrderProduct) => item.productId === product.id);
    if (existingProductIndex !== -1) {
      _detailOrder.products[existingProductIndex].quantity++;
    } else {
      _detailOrder.products.push({
        orderId: detailOrder?.id,
        price: product.price,
        productId: product.id,
        productName: product.name,
        quantity: 1,
        discountPercent: product.discountPercent,
        discountAmount: detailOrder?.isSaleInvoiceDiscount
          ? calcTaxReduction(product.price, product.discountPercent)
          : 0
      });
    }
    updateOrderDiscount(_detailOrder);
  };

  const toggleDiscount = async (checked: boolean) => {
    if (detailOrder) {
      const products = detailOrder.products.map((product) => ({
        ...product,
        discountAmount: checked ? calcTaxReduction(product.price * product.quantity, product.discountPercent) : 0
      }));
      const totalDiscountAmount = products.reduce((sum, item) => sum + item.discountAmount, 0);
      setDetailOrder({
        ...detailOrder,
        isSaleInvoiceDiscount: checked,
        products: products,
        discountAmount: calculateSaleInvoiceDiscount(totalDiscountAmount)
      });
      if (id) await updateSaleDiscountOrder(id, { isSaleInvoiceDiscount: checked });
    }
  };

  const columns: TableColumnsType<OrderProduct> = [
    {
      title: 'STT',
      width: '10%',
      render: (_text, _record, index) => index + 1
    },
    {
      title: 'Tên món',
      width: '20%',
      dataIndex: 'productName'
    },
    {
      title: 'Số lượng món',
      width: '10%',
      dataIndex: 'quantity',
      render: (_text, record, index) =>
        isEditing ? (
          <QuantityInput value={record.quantity} onChange={(value) => handleChangeProductQuantity(index, value)} />
        ) : (
          _text
        )
    },
    {
      title: 'Đơn giá',
      width: '15%',
      dataIndex: 'price',
      render: (price: number) => <span>{formatCurrencyDecimalVND(price)}</span>
    },
    {
      title: 'Thành tiền (VNĐ)',
      width: '15%',
      render: (_text, record) => {
        return formatCurrencyDecimalVND(record.price * record.quantity);
      }
    },
    ...(detailOrder?.isSaleInvoiceDiscount
      ? [
          {
            title: 'Thuế suất',
            width: '15%',
            render: (_text: OrderProduct, record: OrderProduct) => <h2>{record.discountPercent}%</h2>
          },
          {
            title: 'Tiền thuế giảm trừ',
            width: '15%',
            render: (_text: OrderProduct, record: OrderProduct) => (
              <h2>{formatCurrencyDecimalVND(record.discountAmount)}</h2>
            )
          }
        ]
      : []),
    ...(isEditing
      ? [
          {
            title: 'Tác vụ',
            width: '20%',
            render: (_text: OrderProduct, record: OrderProduct) => (
              <BaseButton
                variant='filled'
                icon={<DeleteOutlined />}
                override={theme.blushMist}
                textColor={theme.firestormRed}
                onClick={() => {
                  const _detailOrder = JSON.parse(JSON.stringify(detailOrder));
                  const orderProducts = _detailOrder?.products?.filter(
                    (product: OrderProduct) => product.productId !== record.productId
                  );
                  if (orderProducts && _detailOrder) _detailOrder.products = orderProducts;
                  updateOrderDiscount(_detailOrder);
                }}
              >
                Xóa
              </BaseButton>
            )
          }
        ]
      : [])
  ];

  const handleDeleteOrderEInvoice = async () => {
    if (id) await deleteOrderEInvoice(id);
    setOpenModalDeleteOrderInvoice(false);
    setActiveKey('information');
  };

  const tabItems = useMemo(
    () => [
      {
        key: 'information',
        label: 'Thông tin',
        content: (
          <>
            {!detailOrder?.paidAt && !isEditing && (
              <div className='flex sm:hidden items-center gap-2 justify-end mb-2'>
                <p className='font-semibold'>Giảm trừ hóa đơn bán hàng</p>
                <Switch
                  checked={detailOrder?.isSaleInvoiceDiscount}
                  size='small'
                  value={detailOrder?.isSaleInvoiceDiscount}
                  onChange={toggleDiscount}
                />
              </div>
            )}
            {isEditing && (
              <div className='w-full flex flex-end'>
                <div className='w-full md:w-1/3'>
                  <SelectProduct
                    existingProductIds={detailOrder?.products?.map((product) => product.productId) || []}
                    onSelect={handleAddNewProduct}
                  />
                </div>
              </div>
            )}
            <div className='overflow-y-scroll max-h-[calc(100dvh-330px)] lg:max-h-full pb-10 md:pb-2 w-full'>
              <div className='flex flex-col gap-[15px] mt-2 lg:hidden'>
                {detailOrder?.products &&
                  detailOrder?.products?.length > 0 &&
                  detailOrder?.products.map((item, index: number) => {
                    return (
                      <div
                        key={item?.id}
                        className='w-full p-[10px] rounded-lg justify-between shadow-[0px_0px_15px_0px_rgba(0,0,0,0.05)]'
                      >
                        <div>
                          <div className='flex items-center justify-between gap-2'>
                            <div>
                              <p className='text-sm font-semibold leading-6'>{item?.productName}</p>
                              <p className='text-sm font-normal leading-6'>
                                Thành tiền:{' '}
                                <span className='font-semibold leading-6 '>
                                  {formatCurrencyDecimalVND(item.price * item.quantity)} VNĐ
                                </span>
                              </p>
                            </div>
                            <div className='flex items-center gap-2 ml-auto'>
                              {isEditing ? (
                                <div className='flex items-center gap-[10px]'>
                                  <QuantityInput
                                    value={item.quantity}
                                    onChange={(value) => handleChangeProductQuantity(index, value)}
                                  />
                                  <BaseButton
                                    variant='filled'
                                    icon={<DeleteOutlined />}
                                    override={theme.blushMist}
                                    textColor={theme.firestormRed}
                                    onClick={() => {
                                      const _detailOrder = JSON.parse(JSON.stringify(detailOrder));
                                      const orderProducts = _detailOrder?.products?.filter(
                                        (product: OrderProduct) => product.productId !== item.productId
                                      );
                                      if (orderProducts && _detailOrder) _detailOrder.products = orderProducts;
                                      updateOrderDiscount(_detailOrder);
                                    }}
                                  ></BaseButton>
                                </div>
                              ) : (
                                <div className='p-1 rounded text-white bg-primary min-w-[24px] flex items-center justify-center mt-1'>
                                  <p className='text-sm font-semibold leading-none'>{item?.quantity}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {detailOrder?.isSaleInvoiceDiscount && (
                            <>
                              <hr className='text-xs font-normal my-1'></hr>
                              <p className='text-xs font-normal flex items-center gap-2 justify-between'>
                                Đơn giá:
                                <span className='font-semibold leading-6'>
                                  {formatCurrencyDecimalVND(item.price)} VNĐ
                                </span>
                              </p>
                              <p className='text-xs font-normal flex items-center gap-2 justify-between'>
                                Thuế suất: <span className='font-semibold leading-6'>{item.discountPercent}%</span>
                              </p>
                              <p className='text-xs font-normal flex items-center gap-2 justify-between'>
                                Tiền thế giảm trừ:
                                <span className='font-semibold leading-6'>
                                  {formatCurrencyDecimalVND(item.discountAmount)} VNĐ
                                </span>
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className='hidden lg:flex w-full '>
                <Table<OrderProduct>
                  className='w-full'
                  columns={columns}
                  loading={isLoading}
                  dataSource={detailOrder?.products || []}
                  scroll={{ x: 'max-content' }}
                  pagination={false}
                  summary={() => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={columns.length} className='text-right'>
                          <div className='flex justify-between'>
                            <p className='font-semibold text-primary text-base'>
                              {detailOrder?.isSaleInvoiceDiscount ? 'Tổng thành tiền:' : 'Tổng tiền thanh toán:'}
                            </p>
                            <span className='font-bold text-base'>
                              {formatCurrencyDecimalVND(detailOrder?.totalAmount as number)} VNĐ
                            </span>
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      {detailOrder?.isSaleInvoiceDiscount && (
                        <>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={columns.length} className='text-right'>
                              <div className='flex justify-between'>
                                <p className='font-semibold text-primary text-base'>
                                  Giảm thuế theo NQ số 174/2024/QH15:
                                </p>
                                <span className='font-bold text-base whitespace-nowrap'>
                                  {formatCurrencyDecimalVND(detailOrder?.discountAmount as number)} VNĐ
                                </span>
                              </div>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={columns.length} className='text-right'>
                              <div className='flex justify-between'>
                                <p className='font-semibold text-primary text-base'>Tổng tiền thanh toán:</p>
                                <span className='font-bold text-base'>
                                  {formatCurrencyDecimalVND(
                                    (detailOrder?.totalAmount || 0) - (detailOrder?.discountAmount || 0)
                                  )}{' '}
                                  VNĐ
                                </span>
                              </div>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      )}
                    </Table.Summary>
                  )}
                />
              </div>
            </div>
          </>
        ),
        icon: <InfoCircleOutlined className='text-base' />
      },
      {
        key: 'history',
        label: 'Danh sách các lượt yêu cầu',
        content: (
          <div>
            {!detailOrder?.paidAt && (
              <div className='flex sm:hidden items-center gap-2 justify-end mb-2'>
                <p className='font-semibold'>Giảm trừ hóa đơn bán hàng</p>
                <Switch checked={detailOrder?.isSaleInvoiceDiscount} size='small' onChange={toggleDiscount} />
              </div>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 overflow-y-scroll max-h-[calc(100dvh-330px)] lg:max-h-full'>
              {detailOrder?.requests
                ?.sort((requestB, requestA) => {
                  const dateA = requestA?.createdAt ? new Date(requestA.createdAt).getTime() : 0;
                  const dateB = requestB?.createdAt ? new Date(requestB.createdAt).getTime() : 0;
                  return dateA - dateB;
                })
                .map((request, index) => (
                  <RequestHistoryCard
                    key={request.id}
                    index={detailOrder?.requests?.length - index}
                    request={request}
                  />
                ))}
            </div>
          </div>
        ),
        icon: <HistoryOutlined className='text-base' />
      },
      ...(detailOrder?.isCreatedEInvoice
        ? [
            {
              key: 'e-invoice',
              label: 'Hóa đơn điện tử',
              icon: <FileOutlined className='text-base' />,
              content: (
                <div className='md:max-h-[calc(100dvh-340px)] p-2 sm:p-6 md:p-0 overflow-y-scroll mb-6'>
                  <OrderEInvoiceDetails orderEInvoice={detailOrder?.orderEInvoice} />
                  <div className='flex flex-wrap justify-center md:gap-10 gap-2'>
                    <BaseButton
                      override={theme.danger}
                      size='middle'
                      className='text-[12px] sm:text-sm md:text-base flex-1 sm:flex-initial'
                      onClick={() => setOpenModalDeleteOrderInvoice(true)}
                    >
                      Xóa hóa đơn điện tử
                    </BaseButton>
                    <BaseButton
                      onClick={handleOpenOrderEInvoicePdf}
                      loading={isLoadingOrderEInvoicePdf}
                      className='text-[12px] sm:text-sm md:text-base flex-1 sm:flex-initial'
                    >
                      Xem hóa đơn điện tử (PDF)
                    </BaseButton>
                  </div>
                </div>
              )
            }
          ]
        : [])
    ],
    [detailOrder?.isCreatedEInvoice, isLoadingOrderEInvoicePdf, isEditing, detailOrder]
  );
  const [activeKey, setActiveKey] = useState('information');

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const handleDeleteOrder = async () => {
    await deleteOrder(id);
    navigate(`/order${location?.search}`);
  };

  const handleSelectPaymentMethod = async () => {
    setOpenModalPayment(false);
    if (paymentMethod === PaymentMethod.BANK_TRANSFER && detailOrder && detailOrder?.status !== OrderStatus.PAID) {
      const qrCode = await generateQRCodePayment(detailOrder.id, {
        amount: detailOrder?.totalAmount || 0,
        zone: detailOrder?.table?.zone?.name,
        table: detailOrder?.table?.name,
        description: `${detailOrder?.table?.name} ${detailOrder?.table?.zone?.name} Thanh toan HD`
      });
      if (qrCode) {
        setOpenBankTransferPaymentModal(true);
      } else {
        notification.error({
          message: 'Tạo QR Code thất bại',
          description: 'Vui lòng thử lại'
        });
      }
    } else if (paymentMethod === PaymentMethod.CASH) {
      setOpenConfirmPaymentModal(true);
    }
  };
  const handlePayment = async () => {
    try {
      await payOrder(id, {
        status: OrderStatus.PAID,
        paymentMethod: paymentMethod,
        isSaleInvoiceDiscount: !!detailOrder?.isSaleInvoiceDiscount
      });
      setOpenBankTransferPaymentModal(false);
      setOpenConfirmPaymentModal(false);
      setOpenPaymentSuccessModal(true);
      getDetailOrder(id);
    } catch (error) {}
  };

  const handlePaymentSuccess = () => {
    setOpenBankTransferPaymentModal(false);
    setOpenConfirmPaymentModal(false);
    setOpenPaymentSuccessModal(true);
    getDetailOrder(id);
  };

  const handleCancel = () => {
    if (storeDetailOrder) {
      resetOrder(storeDetailOrder);
    }
    setIsEditing(false);
  };

  const handleUpdateOrder = async () => {
    if (!detailOrder?.products?.length) {
      notification.error({
        message: 'Cập nhật đơn hàng thất bại',
        description: 'Đơn hàng không được để trống. Bạn vui lòng giữ lại ít nhất một món trước khi tiếp tục'
      });
      return;
    }
    if (id) await updateOrder(id, { products: detailOrder?.products || [] });
    await getDetailOrder(id);
    setIsEditing(false);
  };

  const handleOpenPaymentModal = async () => {
    const isHasRemainingRequest = await checkRemainingOrderRequest(id);
    if (isHasRemainingRequest) {
      notification.error({
        message: 'Thanh toán thất bại',
        description: 'Phiên này vẫn còn yêu cầu đang thực hiện hoặc đã phục vụ chưa tính tiền'
      });
    } else setOpenModalPayment(true);
  };
  const isTablet = useMediaQuery('(max-width: 1023px)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const posIntegration = useMemo(() => {
    return currentUser?.currentUserStore?.store?.company?.posIntegration;
  }, [currentUser]);
  return (
    <>
      <Spin spinning={isLoading}>
        <DetailHeader
          title={
            isTablet ? (
              <div className='flex items-center justify-start gap-[10px] w-full'>
                <p className='text-black font-semibold text-[16px] min-w-[150px] line-clamp-1'>
                  {detailOrder?.code} - {detailOrder?.zoneName} - {detailOrder?.tableName}
                </p>
                {detailOrder?.status === OrderStatus.PAID ? (
                  <></>
                ) : !isEditing ? (
                  <div className='inline-block'>
                    {!posIntegration && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className='flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary gap-[6px]'
                      >
                        <FiEdit size={16} /> <p className='text-[10px] font-semibold whitespace-nowrap'>Chỉnh sửa</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              'Chi tiết đơn hàng'
            )
          }
          rightElement={
            <div className='flex items-center gap-2 mb-4 flex-wrap'>
              <div>{detailOrder?.status ? RequestStatusTag(detailOrder?.status) : null}</div>
              <div>{RequestEInvoiceStatusTag(!!detailOrder?.isCreatedEInvoice)}</div>
              <div>
                {detailOrder?.status === OrderStatus.PAID && !posIntegration && (
                  <BaseButton override={theme.sunsetEmber} onClick={() => handlePrint()} icon={<PrinterOutlined />}>
                    In hóa đơn
                  </BaseButton>
                )}
              </div>
              {!detailOrder?.isCreatedEInvoice && detailOrder?.paidAt && !posIntegration && (
                <BaseButton
                  className='hidden lg:flex'
                  override={theme.success}
                  icon={<LiaFileInvoiceDollarSolid className='text-xl' />}
                  onClick={() => {
                    navigate(`invoice${location?.search}`);
                  }}
                >
                  Tạo hóa đơn điện tử
                </BaseButton>
              )}
            </div>
          }
          handleBack={() => {
            navigate(`/order${location?.search}`);
          }}
        >
          <div className='overflow-y-scroll max-h-full lg:max-h-[calc(100dvh-100px)] '>
            <div>
              <div className='hidden'>
                <div className='w-[320px]' ref={contentRef}>
                  <Bill qrCode={qrCode} order={detailOrder} />
                </div>
              </div>
              {!posIntegration && (
                <div className='justify-end items-center gap-x-2 mb-4 hidden md:flex'>
                  {isEditing ? (
                    <>
                      <BaseButton variant='outlined' onClick={handleCancel}>
                        Hủy bỏ
                      </BaseButton>
                      <BaseButton onClick={handleUpdateOrder} loading={isLoading}>
                        Lưu
                      </BaseButton>
                    </>
                  ) : (
                    <>
                      {detailOrder?.status !== OrderStatus.PAID && (
                        <div className='flex items-center gap-2 flex-wrap'>
                          <BaseButton color='danger' onClick={() => setOpenModalDelete(true)}>
                            Xóa đơn
                          </BaseButton>
                          <BaseButton
                            onClick={() => {
                              setIsEditing(true);
                            }}
                          >
                            Chỉnh sửa
                          </BaseButton>
                          <BaseButton onClick={handleOpenPaymentModal}>Thanh toán</BaseButton>
                          <BaseButton
                            override={theme.sunsetEmber}
                            onClick={() => handlePrint()}
                            icon={<PrinterOutlined />}
                          >
                            In tạm tính
                          </BaseButton>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <fieldset className='mb-4 p-3 border border-gray-200 rounded-md hidden lg:flex'>
                <legend className='px-2 text-primary'>
                  <p className='text-sm mb-1'>
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
            </div>
            {/* mobile */}
            <div className='flex sm:flex-row justify-between flex-col gap-2 lg:hidden'>
              <p className='font-medium truncate max-w-[250px]'>
                Khách hàng: <span className='font-normal'>{detailOrder?.customerName || ''}</span>
              </p>
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
            <div className='bg-primary text-white h-10 w-full rounded-t-md flex items-center justify-between px-[10px] mt-[15px] lg:hidden'>
              <p>Tổng tiền thanh toán</p>
              <span className='font-bold ml-1'>
                {formatCurrencyDecimalVND((detailOrder?.totalAmount || 0) - (detailOrder?.discountAmount || 0))} VNĐ
              </span>
            </div>
            {detailOrder?.isSaleInvoiceDiscount && (
              <div className='bg-primary-50 text-primary w-full rounded-md lg:hidden px-[10px] py-2'>
                <div className='flex items-center gap-2 justify-between mb-1'>
                  <p className='font-semibold'>Tổng thành tiền</p>
                  <span className='font-bold ml-1'>{formatCurrencyDecimalVND(detailOrder?.totalAmount)} VNĐ </span>
                </div>
                <div className='flex items-center gap-2 justify-between'>
                  <p className='font-semibold'>Giảm thuế theo NQ số 174/2024/QH15</p>
                  <span className='font-bold ml-1 whitespace-nowrap'>
                    {formatCurrencyDecimalVND(detailOrder?.discountAmount as number)} VNĐ{' '}
                  </span>
                </div>
              </div>
            )}
            <div className='mt-[15px] relative'>
              <Tabs activeKey={activeKey} onChange={handleTabChange}>
                {tabItems.map((item) => (
                  <TabPane tab={item.label} key={item.key} icon={item.icon}>
                    {item.content}
                  </TabPane>
                ))}
              </Tabs>
              {!detailOrder?.paidAt && !isEditing && (
                <div className='absolute right-0 hidden sm:flex items-center gap-2 top-3'>
                  <p className='font-semibold'>Giảm trừ hóa đơn bán hàng</p>
                  <Switch checked={detailOrder?.isSaleInvoiceDiscount} size='small' onChange={toggleDiscount} />
                </div>
              )}
            </div>
            {!posIntegration && (
              <div className='fixed bottom-0 flex gap-4 justify-between w-full left-0 p-1 sm:p-4 bg-white lg:hidden'>
                {!detailOrder?.isCreatedEInvoice && detailOrder?.paidAt && !posIntegration && (
                  <BaseButton
                    className='flex lg:hidden w-full'
                    override={theme.success}
                    icon={<LiaFileInvoiceDollarSolid className='text-xl' />}
                    onClick={() => {
                      navigate(`invoice${location?.search}`);
                    }}
                  >
                    Tạo hóa đơn điện tử
                  </BaseButton>
                )}
                {isEditing ? (
                  <div className='flex gap-4 ml-auto justify-center w-full'>
                    <BaseButton variant='outlined' onClick={handleCancel}>
                      Hủy bỏ
                    </BaseButton>
                    <BaseButton onClick={handleUpdateOrder} loading={isLoading}>
                      Lưu
                    </BaseButton>
                  </div>
                ) : (
                  <>
                    {detailOrder?.status !== OrderStatus.PAID && (
                      <div className='flex items-center gap-1 sm:gap-2 justify-between w-full'>
                        <BaseButton className='w-full' color='danger' onClick={() => setOpenModalDelete(true)}>
                          Xóa đơn
                        </BaseButton>
                        <BaseButton className='w-full' onClick={handleOpenPaymentModal}>
                          Thanh toán
                        </BaseButton>
                        <BaseButton
                          className='w-full'
                          override={theme.sunsetEmber}
                          onClick={() => handlePrint()}
                          icon={<PrinterOutlined />}
                        >
                          In tạm tính
                        </BaseButton>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          {/* modal */}
          <ModalDelete
            isOpen={openModalDelete}
            onClose={() => setOpenModalDelete(false)}
            onConfirm={handleDeleteOrder}
            loading={isLoading}
          >
            <h2>Bạn muốn xoá đơn hàng này không?</h2>
          </ModalDelete>
          <ModalPayment
            isOpen={openModalPayment}
            onClose={() => {
              setIsExportEInvoice(false);
              setOpenModalPayment(false);
            }}
            onConfirm={handleSelectPaymentMethod}
            loading={isLoading}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onConfirmAndExportEInvoice={() => {
              setIsExportEInvoice(true);
              handleSelectPaymentMethod();
            }}
          />
          <ModalBankTransfer
            isOpen={openBankTransferPaymentModal}
            onClose={() => setOpenBankTransferPaymentModal(false)}
            onConfirm={handlePayment}
            onPaymentSuccess={handlePaymentSuccess}
            loading={isLoading}
            totalAmount={(detailOrder?.totalAmount || 0) - (detailOrder?.discountAmount || 0)}
            status={detailOrder?.status}
            qrCode={qrCode}
          />
          <ModalConfirm
            isOpen={openConfirmPaymentModal}
            onClose={() => setOpenConfirmPaymentModal(false)}
            onConfirm={handlePayment}
            loading={isLoading}
          >
            Bạn có chắc là khách hàng đã thanh toán bằng tiền mặt?
          </ModalConfirm>
          <ModalNotification
            isOpen={openPaymentSuccessModal}
            icon={<FaCheck />}
            onClose={() => {
              setOpenPaymentSuccessModal(false);
            }}
            // onConfirm={() => {
            //   setOpenPaymentSuccessModal(false);
            //   navigate('/order');
            // }}
            onConfirm={() => {
              setOpenPaymentSuccessModal(false);
            }}
            loading={isLoading}
            showCancel={false}
            confirmLabel='Đóng'
            className='text-center'
          ></ModalNotification>
          <CustomModal
            isOpen={openPaymentSuccessModal}
            //title='Thông báo'
            icon={
              <div className='bg-mintMist p-2 rounded-[50%]'>
                <div className='bg-lightGreen p-2 rounded-[50%]'>{<FaCheck />}</div>
              </div>
            }
            onClose={() => {
              setOpenPaymentSuccessModal(false);
              if (isExportEInvoice) {
                navigate('invoice');
              }
            }}
            onConfirm={() => {
              setOpenPaymentSuccessModal(false);
              if (isExportEInvoice) {
                navigate('invoice');
              }
            }}
            type={'primary'}
            textColorIcon='#15803D'
            showCancel={false}
            confirmLabel={'Đóng'}
            className='text-center'
          >
            Thanh toán thành công đơn hàng {detailOrder?.code}!
          </CustomModal>
          <ModalConfirm
            isOpen={openModalDeleteOrderInvoice}
            onClose={() => setOpenModalDeleteOrderInvoice(false)}
            onConfirm={() => handleDeleteOrderEInvoice()}
            loading={isLoading}
            icon={<CiBellOn />}
            title='Xác nhận'
          >
            <div className='flex-1 gap-3 flex flex-col'>
              <div className='flex mb-1 text-base gap-4'>
                <p className='whitespace-nowrap font-semibold'>Ngày xóa hóa đơn</p>
                <p>{dayjs().format('DD/MM/YYYY')}</p>
              </div>
              <div className='flex flex-col text-base text-start'>
                <p className='whitespace-nowrap font-semibold mb-2'>Nội dung xóa hóa đơn</p>
                <p>{`Xóa hóa đơn số ${detailOrder?.code || ''} theo yêu cầu `}</p>
              </div>
            </div>
          </ModalConfirm>
          <iframe
            src={orderEInvoicePdf}
            className={`w-[768px] h-[calc(100svh-100px)] fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
              !showEInvoicePdf && 'hidden'
            }`}
            title='Hóa đơn điện tử'
          ></iframe>

          {showEInvoicePdf && orderEInvoicePdf && (
            <div
              className='fixed inset-0 bg-black/50 z-40 cursor-pointer'
              onClick={() => {
                setShowEInvoicePdf(false);
                setOrderEInvoicePdf('');
              }}
            ></div>
          )}
        </DetailHeader>
      </Spin>
    </>
  );
}
