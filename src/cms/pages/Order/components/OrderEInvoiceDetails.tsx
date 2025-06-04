import { Collapse, Divider } from 'antd';
import dayjs from 'dayjs';
import { eInvoiceTypes, eInvoiceFormats, eInvoiceModes, paymentOptions } from 'src/shared/common/constant';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import useStoreStore from 'src/store/useStoreStore';
import { OrderEInvoice } from 'src/types/order.type';
interface OrderEInvoiceDetailsProps {
  orderEInvoice: OrderEInvoice;
}

export default function OrderEInvoiceDetails({ orderEInvoice }: OrderEInvoiceDetailsProps) {
  const { banks } = useStoreStore();

  return (
    <div>
      <div className='rounded-md mb-3 overflow-hidden shadow-sm'>
        <p className='h-10 flex flex-row w-full p-2 pr-3 items-center bg-primary-50 text-primary text-[16px] rounded-t-md font-medium'>
          Thông tin hóa đơn điện tử
        </p>
        <div className='bg-white lg:pt-2 px-3 pb-5'>
          <div className='flex flex-col md:flex-row gap-x-10'>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label text='ID hoá đơn' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
              <p className='break-all break-works'>{orderEInvoice?.eInvoiceId}</p>
            </Field>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label
                text='Mã của cơ quan thuế'
                className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
              />
              <p className='break-all break-works'>{orderEInvoice.eInvoiceTaxAuthorityCode}</p>
            </Field>
          </div>
          <div className='flex flex-col md:flex-row gap-x-10'>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label
                text='Ký hiệu hoá đơn'
                className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
              />
              <p>{orderEInvoice.eInvoiceSymbol}</p>
            </Field>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label text='Số hoá đơn' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
              <p>{orderEInvoice.eInvoiceNumber}</p>
            </Field>
          </div>
          <div className='flex flex-col md:flex-row gap-x-10'>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label text='Loại hóa đơn' className='whitespace-nowrap text-sm md:text-base min-w-[174px]' />
              <p>{`${eInvoiceTypes.find((item) => item.value === orderEInvoice.eInvoiceType)?.label} - (${eInvoiceFormats.find((item) => item.value === orderEInvoice.eInvoiceFormat)?.label} - ${eInvoiceModes.find((item) => item.value === orderEInvoice.eInvoiceMode)?.label})`}</p>
            </Field>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label text='Hoá đơn thay thế' className='whitespace-nowrap text-sm md:text-base min-w-[174px]' />
              <p>{orderEInvoice.eInvoiceReplacedSymbol}</p>
            </Field>
          </div>
          <div className='flex flex-col md:flex-row gap-x-10'>
            <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
              <Label text='Trạng thái hoá điện tử' className='whitespace-nowrap text-sm md:text-base min-w-[174px]' />
              <p>Đã tạo</p>
            </Field>
          </div>
        </div>
      </div>
      <Collapse
        size='small'
        bordered={false}
        expandIconPosition='end'
        defaultActiveKey={['2']}
        className='[&_.ant-collapse-header]:!bg-primary-50 [&_.ant-collapse-header]:!text-primary [&_.ant-collapse-header]:!text-base [&_.ant-collapse-header]:!font-semibold [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-header]:!rounded-t-md  shadow-sm mb-3'
        items={[
          {
            key: '2',
            label: 'Thông tin người bán',
            children: (
              <>
                <div className='bg-white pb-4'>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Tên công ty người bán'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p>{orderEInvoice.vendorCompanyName}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='MST công ty người bán'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-works'>{orderEInvoice.vendorTaxCode}</p>
                    </Field>
                  </div>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Địa chỉ'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p>{orderEInvoice.vendorAddress}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Điện thoại'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-works'>{orderEInvoice.vendorPhone}</p>
                    </Field>
                  </div>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Ngân hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='overflow-hidden text-ellipsis w-full'>{orderEInvoice.vendorBankName}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Số tài khoản'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-works'>{orderEInvoice.vendorBankNumber}</p>
                    </Field>
                  </div>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label text='Email' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
                      <p className='break-all break-words'>{orderEInvoice.vendorEmail} </p>
                    </Field>
                  </div>
                </div>
              </>
            )
          }
        ]}
      />

      <Collapse
        size='small'
        bordered={false}
        expandIconPosition='end'
        defaultActiveKey={['3']}
        className='[&_.ant-collapse-header]:!bg-primary-50 [&_.ant-collapse-header]:!text-primary [&_.ant-collapse-header]:!text-base [&_.ant-collapse-header]:!font-semibold [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-header]:!rounded-t-md shadow-sm mb-3'
        items={[
          {
            key: '3',
            label: 'Thông tin khách hàng',
            children: (
              <>
                <div className='bg-white  pb-4'>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Tên khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p>{orderEInvoice.customerName}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Tên công ty khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p>{orderEInvoice.customerCompanyName}</p>
                    </Field>
                  </div>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='MST khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-works'>{orderEInvoice.customerTaxCode}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Địa chỉ khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p>{orderEInvoice.customerAddress}</p>
                    </Field>
                  </div>
                  <div className='flex flex-col md:flex-row gap-x-10'>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Điện thoại khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-works'>{orderEInvoice.customerPhone}</p>
                    </Field>
                    <Field className='flex !flex-row  gap-x-8 md:gap-x-4 mt-4'>
                      <Label
                        text='Email khách hàng'
                        className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                      />
                      <p className='break-all break-words'>{orderEInvoice.customerEmail}</p>
                    </Field>
                  </div>
                </div>
              </>
            )
          }
        ]}
      />
      <div className='mb-6'></div>
    </div>
  );
}
