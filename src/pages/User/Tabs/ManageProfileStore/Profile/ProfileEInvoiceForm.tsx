import { Table } from 'antd';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { eInvoiceTypes, eInvoiceFormats, eInvoiceModes } from 'src/shared/common/constant';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import FormSelect from 'src/shared/components/Form/FormSelect';
import useAuthStore from 'src/store/authStore';
import { EInvoiceSymbol, Store } from 'src/types/store.type';
import { EInvoiceConfigPayload } from 'src/validate/userSchema';
import { BiTransferAlt } from 'react-icons/bi';

interface ProfileEInvoiceForm {
  control: Control<EInvoiceConfigPayload>;
  errors: FieldErrors<EInvoiceConfigPayload>;
  loading: boolean;
  setValue: UseFormSetValue<EInvoiceConfigPayload>;
  eInvoiceFormat: string | undefined | null;
  isConfigurable: boolean;
  listSymbol: EInvoiceSymbol[];
  isChecking: boolean;
  handleCheckConnection: () => void;
}

export default function ProfileEInvoiceForm({
  control,
  errors,
  loading,
  setValue,
  eInvoiceFormat,
  isConfigurable,
  listSymbol,
  isChecking,
  handleCheckConnection
}: ProfileEInvoiceForm) {
  const { currentUser } = useAuthStore();

  const columns = [
    {
      title: 'Ký hiệu',
      width: '25%',
      dataIndex: 'eInvoiceSymbol',
      key: 'eInvoiceSymbol',
      render: () => (
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
          className='ant-select-max-width'
          size='large'
        />
      )
    },
    {
      title: 'Loại hóa đơn',
      width: '25%',
      dataIndex: 'eInvoiceType',
      key: 'eInvoiceType',
      render: () => (
        <FormSelect
          name={'eInvoiceType'}
          options={eInvoiceTypes}
          errors={errors}
          fieldNames={{
            label: 'label',
            value: 'value'
          }}
          placeholder='Chọn loại hóa đơn'
          control={control}
          className='ant-select-max-width'
          size='large'
          onChange={() => {}}
          open={false}
          suffixIcon={null}
        />
      )
    },
    {
      title: 'Kiểu hóa đơn',
      width: '25%',
      dataIndex: 'eInvoiceFormat',
      key: 'eInvoiceFormat',
      render: () => (
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
          className='ant-select-max-width'
          size='large'
          onSelect={() => setValue('eInvoiceMode', '')}
          onChange={() => {}}
          open={false}
          suffixIcon={null}
        />
      )
    },
    {
      title: 'Hình thức',
      width: '25%',
      dataIndex: 'eInvoiceMode',
      key: 'eInvoiceMode',
      render: () => (
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
          className='ant-select-max-width'
          size='large'
          onChange={() => {}}
          open={false}
          suffixIcon={null}
        />
      )
    }
  ];
  return (
    <div>
      <h1 className='text-lg font-semibold text-primary'>Thông tin kết nối hóa đơn điện tử</h1>
      <div className='flex flex-col md:grid md:grid-cols-2 md:gap-4'>
        <Field className='mt-4'>
          <div className='flex justify-between items-center md:block'>
            <Label text='Đường dẫn đích' validate={true} />
            <div className='md:hidden'>
              <BaseButton
                className='w-fit h-[40px] border-none !bg-transparent'
                variant='outlined'
                loading={isChecking}
                onClick={() => handleCheckConnection()}
                icon={<BiTransferAlt className='text-2xl' />}
              >
                Kiểm tra kết nối
              </BaseButton>
            </div>
          </div>
          <FormInput
            control={control}
            name='eInvoiceUrl'
            type='text'
            disabled={false}
            placeholder='Đường dẫn đích'
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='mt-6 hidden md:block'>
          <Label text='&nbsp;' />
          <BaseButton
            className='w-fit h-[38px]'
            variant='outlined'
            loading={isChecking}
            onClick={() => handleCheckConnection()}
            icon={<BiTransferAlt className='text-2xl' />}
          >
            Kiểm tra kết nối
          </BaseButton>
        </Field>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <Field className='mt-4'>
          <Label text='Tên đăng nhập' validate={true} />
          <FormInput
            control={control}
            name='eInvoiceUsername'
            type='text'
            placeholder='Tên đăng nhập'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>
        <Field className='mt-4'>
          <Label text='Mật khẩu' validate={true} />
          <FormInput
            control={control}
            name='eInvoicePassword'
            type='password'
            placeholder='Mật khẩu'
            disabled={false}
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      {isConfigurable && (
        <div className='mt-10'>
          <h1 className='text-lg font-semibold mb-2 text-primary'>Thông tin cấu hình hóa đơn điện tử</h1>
          <div className='hidden md:block'>
            <Table
              scroll={{ x: 'max-content' }}
              dataSource={[currentUser?.currentUserStore?.store as Store]}
              columns={columns}
              pagination={false}
              size='small'
              className='mt-4'
            />
          </div>
          <div className='block md:hidden'>
            <div className='flex flex-col'>
              <div className='flex flex-col gap-2'>
                <Label text='Loại hóa đơn' />
                <FormSelect
                  name={'eInvoiceType'}
                  options={eInvoiceTypes}
                  errors={errors}
                  fieldNames={{
                    label: 'label',
                    value: 'value'
                  }}
                  placeholder='Chọn ký hiệu'
                  control={control}
                  className='ant-select-max-width'
                  size='large'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label text='Kiểu hóa đơn' />
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
                  className='ant-select-max-width'
                  size='large'
                  onSelect={() => setValue('eInvoiceMode', '')}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label text='Hình thức' />
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
                  className='ant-select-max-width'
                  size='large'
                />
              </div>
              <div className='flex flex-col gap-2'>
                <Label text='Ký hiệu' />
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
                  className='ant-select-max-width'
                  size='large'
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
