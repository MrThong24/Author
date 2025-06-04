import { Collapse, Table } from 'antd';
import dayjs from 'dayjs';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import NoData from 'src/cms/components/NoData/NoData';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { eInvoiceTypes, eInvoiceFormats, eInvoiceModes, paymentOptions } from 'src/shared/common/constant';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import FormSelect from 'src/shared/components/Form/FormSelect';
import useStoreStore from 'src/store/useStoreStore';
import { Order } from 'src/types/order.type';
import { EInvoiceSymbol, Store } from 'src/types/store.type';
import { EInvoiceOrderPayload } from 'src/validate/orderSchema';

interface OrderEInvoiceForm {
  control: Control<EInvoiceOrderPayload>;
  errors: FieldErrors<EInvoiceOrderPayload>;
  loading: boolean;
  setValue: UseFormSetValue<EInvoiceOrderPayload>;
  eInvoiceFormat: string | undefined;
  listSymbol: EInvoiceSymbol[];
  detailOrder: Order | null;
  store: Store | undefined;
}

export default function OrderEInvoiceForm({
  control,
  errors,
  loading,
  setValue,
  eInvoiceFormat,
  listSymbol,
  detailOrder,
  store
}: OrderEInvoiceForm) {
  const { banks } = useStoreStore();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  return (
    <div>
      <div className='rounded-md mb-3 overflow-hidden shadow-sm'>
        <p className='h-10 flex flex-row w-full p-2 pr-3 items-center bg-primary-50 text-primary text-[16px] rounded-t-md font-medium'>
          Thông tin hóa đơn điện tử
        </p>
        <div className='bg-white pt-6 px-3 pb-5'>
          <div className='flex flex-col md:flex-row gap-x-10'>
            {detailOrder && (
              <Field className='flex flex-col md:!flex-row gap-x-2'>
                <Label
                  text='Loại hóa đơn'
                  validate={true}
                  className='whitespace-nowrap text-sm md:text-base md:pt-2 min-w-[174px]'
                />
                <FormSelect
                  name={'eInvoiceType'}
                  options={detailOrder?.isSaleInvoiceDiscount ? [eInvoiceTypes[1]] : eInvoiceTypes}
                  errors={errors}
                  fieldNames={{
                    label: 'label',
                    value: 'value'
                  }}
                  placeholder='Chọn loại hóa đơn'
                  control={control}
                  className='ant-select-max-width [&_.ant-select-selection-item]:!text-[13px] lg:[&_.ant-select-selection-item]:!text-sm'
                  size={isMobile ? 'middle' : 'large'}
                />
              </Field>
            )}
            <Field className='flex flex-col md:!flex-row gap-x-2'>
              <Label
                text='Kiểu hóa đơn'
                validate={true}
                className='whitespace-nowrap text-sm md:text-base md:pt-2 min-w-[174px]'
              />
              <FormSelect
                name={'eInvoiceFormat'}
                options={eInvoiceFormats}
                errors={errors}
                fieldNames={{
                  label: 'label',
                  value: 'value'
                }}
                placeholder='Chọn kiểu hóa đơn'
                control={control}
                className='ant-select-max-width [&_.ant-select-selection-item]:!text-[13px] lg:[&_.ant-select-selection-item]:!text-sm'
                size={isMobile ? 'middle' : 'large'}
                onSelect={() => setValue('eInvoiceMode', '')}
              />
            </Field>
          </div>
          <div className='flex flex-col md:flex-row gap-x-10'>
            <Field className='flex flex-col md:!flex-row gap-x-2'>
              <Label
                text='Hình thức'
                validate={true}
                className='whitespace-nowrap text-sm md:text-base md:pt-2 min-w-[174px]'
              />
              <FormSelect
                name={'eInvoiceMode'}
                options={eInvoiceFormat === 'T' ? eInvoiceModes : [eInvoiceModes[0]]}
                errors={errors}
                fieldNames={{
                  label: 'label',
                  value: 'value'
                }}
                placeholder='Chọn hình thức'
                control={control}
                className='ant-select-max-width [&_.ant-select-selection-item]:!text-[13px] lg:[&_.ant-select-selection-item]:!text-sm'
                size={isMobile ? 'middle' : 'large'}
              />
            </Field>
            <Field className='flex flex-col md:!flex-row gap-x-2'>
              <Label
                text='Ký hiệu'
                validate={true}
                className='whitespace-nowrap text-sm md:text-base md:pt-2 min-w-[174px]'
              />
              <FormSelect
                name={'eInvoiceSymbol'}
                options={listSymbol.map((item) => ({ value: item.khhdon, label: item.khhdon }))}
                errors={errors}
                fieldNames={{
                  label: 'label',
                  value: 'value'
                }}
                placeholder='Chọn hình thức'
                control={control}
                notFoundContent={<NoData />}
                className='ant-select-max-width  [&_.ant-select-selection-item]:!text-[13px] lg:[&_.ant-select-selection-item]:!text-sm'
                size={isMobile ? 'middle' : 'large'}
              />
            </Field>
          </div>
          <div className='flex flex-col md:flex-row gap-x-10 gap-y-6'>
            <Field className='flex !flex-row gap-x-8 md:gap-x-4'>
              <Label text='Ngày tạo HDDT' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
              <p>{dayjs().format('DD/MM/YYYY')}</p>
            </Field>
            <Field className='flex !flex-row gap-x-8 md:gap-x-4'>
              <Label
                text='Phương thức thanh toán '
                className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
              />
              <p>{paymentOptions.find((item) => item.value === detailOrder?.paymentMethod)?.label}</p>
            </Field>
          </div>
        </div>
      </div>
      <Collapse
        defaultActiveKey={['2']}
        size='small'
        expandIconPosition='end'
        bordered={false}
        className='[&_.ant-collapse-header]:!bg-primary-50 [&_.ant-collapse-header]:!text-primary [&_.ant-collapse-header]:!font-semibold [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-header]:!text-base [&_.ant-collapse-header]:!rounded-t-md shadow-sm text-sm mb-3'
        items={[
          {
            key: '2',
            label: 'Thông tin người bán',
            children: (
              <div className='bg-white pt-2 pb-4'>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Tên công ty người bán'
                      className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                    />
                    <p>{store?.name}</p>
                  </Field>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='MST công ty người bán'
                      className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                    />
                    <p className='break-works break-all'>{store?.taxCode}</p>
                  </Field>
                </div>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label text='Địa chỉ' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
                    <p>{store?.address}</p>
                  </Field>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Điện thoại'
                      className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                    />
                    <p className='break-all break-works'>{store?.phone}</p>
                  </Field>
                </div>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Ngân hàng'
                      className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                    />
                    <p className='overflow-hidden text-ellipsis w-full flex-1'>
                      {banks.find((bank) => bank.bin === store?.bankBin)?.name}
                    </p>
                  </Field>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Số tài khoản'
                      className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]'
                    />
                    <p className='break-all break-works'>{store?.bankNumber}</p>
                  </Field>
                </div>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex !flex-row mt-4 gap-x-8 md:gap-x-4'>
                    <Label text='Email' className='whitespace-nowrap text-sm md:text-base min-w-[174px] mt-[-2px]' />
                    <p className='break-all break-words'>{store?.email}</p>
                  </Field>
                </div>
              </div>
            )
          }
        ]}
      />
      <Collapse
        size='small'
        defaultActiveKey={['3']}
        expandIconPosition='end'
        bordered={false}
        className='[&_.ant-collapse-header]:!bg-primary-50 [&_.ant-collapse-header]:!text-primary [&_.ant-collapse-header]:!font-semibold [&_.ant-collapse-content]:!bg-white [&_.ant-collapse-header]:!text-base [&_.ant-collapse-header]:!rounded-t-md shadow-sm text-sm mb-3'
        items={[
          {
            key: '3',
            label: 'Thông tin khách hàng',
            children: (
              <div className='bg-white pt-2 pb-4'>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Tên khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerName'
                      placeholder='Tên khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Tên công ty khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerCompanyName'
                      placeholder='Tên công ty khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                </div>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='MST khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerTaxCode'
                      placeholder='Mã số thuế khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Địa chỉ khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerAddress'
                      placeholder='Địa chỉ khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                </div>
                <div className='flex flex-col md:flex-row gap-x-10'>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Điện thoại khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerPhone'
                      placeholder='Điện thoại khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                  <Field className='flex flex-col md:flex-row mt-2 md:mt-4 gap-x-8 md:gap-x-4'>
                    <Label
                      text='Email khách hàng'
                      className='whitespace-nowrap text-sm md:text-base pt-2 min-w-[174px]'
                    />
                    <FormInput
                      control={control}
                      errors={errors}
                      name='customerEmail'
                      placeholder='Email khách hàng'
                      className='[&.ant-input]:!text-[13px] lg:[&.ant-input]:!text-[14px]'
                      size={isMobile ? 'middle' : 'large'}
                    />
                  </Field>
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
