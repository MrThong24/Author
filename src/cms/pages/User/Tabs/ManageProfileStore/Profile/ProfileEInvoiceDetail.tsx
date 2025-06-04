import { Skeleton, Table } from 'antd';
import { Store } from 'antd/es/form/interface';
import { BiTransferAlt } from 'react-icons/bi';
import NoData from 'src/cms/components/NoData/NoData';
import { eInvoiceFormats, eInvoiceModes, eInvoiceTypes } from 'src/shared/common/constant';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import useStoreStore from 'src/store/useStoreStore';
import { EInvoiceConfigPayload } from 'src/validate/userSchema';

interface ProfileEInvoiceDetailProps {
  isChecking: boolean;
  eInvoiceConfig: EInvoiceConfigPayload;
  handleCheckConnection: () => void;
}

export default function ProfileEInvoiceDetail({
  isChecking,
  eInvoiceConfig,
  handleCheckConnection
}: ProfileEInvoiceDetailProps) {
  const { isLoading } = useStoreStore();
  const columns = [
    {
      title: 'Ký hiệu',
      width: '25%',
      dataIndex: 'eInvoiceSymbol',
      key: 'eInvoiceSymbol'
    },
    {
      title: 'Loại hóa đơn',
      width: '25%',
      dataIndex: 'eInvoiceType',
      key: 'eInvoiceType',
      render: (value: string) => {
        return <p className='text-sm'>{eInvoiceTypes.find((item) => item.value === value)?.label}</p>;
      }
    },
    {
      title: 'Kiểu hóa đơn',
      width: '25%',
      dataIndex: 'eInvoiceFormat',
      key: 'eInvoiceFormat',
      render: (value: string) => {
        return <p className='text-sm'>{eInvoiceFormats.find((item) => item.value === value)?.label}</p>;
      }
    },
    {
      title: 'Hình thức',
      width: '25%',
      dataIndex: 'eInvoiceMode',
      key: 'eInvoiceMode',
      render: (value: string) => {
        return <p className='text-sm'>{eInvoiceModes.find((item) => item.value === value)?.label}</p>;
      }
    }
  ];
  return (
    <div>
      <h1 className='text-lg font-semibold text-primary'>Thông tin kết nối hóa đơn điện tử</h1>
      <div className='md:grid md:grid-cols-2 md:gap-4'>
        <Field className='mt-6'>
          <div className='flex justify-between items-center md:block'>
            <Label text='Đường dẫn đích' validate={true} />
            <div className='md:hidden'>
              <BaseButton
                className='w-fit h-[40px] border-none !bg-transparent'
                variant='outlined'
                disabled={!eInvoiceConfig}
                loading={isChecking}
                onClick={() => handleCheckConnection()}
                icon={<BiTransferAlt className='text-2xl' />}
              >
                Kiểm tra kết nối
              </BaseButton>
            </div>
          </div>
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full min-h-[40px] break-words px-3 py-3 text-sm border-gray-200 rounded-md bg-white items-center shadow-sm'>
              {eInvoiceConfig?.eInvoiceUrl}
            </div>
          )}
        </Field>
        <Field className='mt-8 hidden md:block'>
          <Label text='&nbsp;' />
          <BaseButton
            className='w-fit h-[40px]'
            variant='outlined'
            disabled={!eInvoiceConfig}
            loading={isChecking}
            onClick={() => handleCheckConnection()}
            icon={<BiTransferAlt className='text-2xl' />}
          >
            Kiểm tra kết nối
          </BaseButton>
        </Field>
      </div>
      <div className='grid grid-cols-1  md:grid-cols-2 md:gap-4 '>
        <Field className='mt-6'>
          <Label text='Tên đăng nhập' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {eInvoiceConfig?.eInvoiceUsername}
            </div>
          )}
        </Field>
        <Field className='mt-6'>
          <Label text='Mật khẩu' validate={false} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 border-gray-200 rounded-md bg-white flex shadow-sm text-base items-center'>
              {eInvoiceConfig?.eInvoicePassword ? '••••••••' : ''}
            </div>
          )}
        </Field>
      </div>
      <div className='mt-10'>
        <h1 className='text-lg font-semibold mb-2 text-primary'>Thông tin cấu hình hóa đơn điện tử</h1>
        <div className='hidden md:block h-fit'>
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={eInvoiceConfig?.eInvoiceType ? [eInvoiceConfig] : []}
            columns={columns}
            pagination={false}
            size='small'
            className='mt-4'
            locale={{ emptyText: <NoData /> }}
          />
        </div>
        <div className='block md:hidden'>
          {eInvoiceConfig?.eInvoiceType ? (
            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <Label text='Loại hóa đơn' />
                <p className='text-sm'>{eInvoiceConfig?.eInvoiceType}</p>
              </div>
              <div className='flex flex-col gap-1'>
                <Label text='Kiểu hóa đơn' />
                <p className='text-sm'>{eInvoiceConfig?.eInvoiceFormat}</p>
              </div>
              <div className='flex flex-col gap-1'>
                <Label text='Hình thức' />
                <p className='text-sm'>{eInvoiceConfig?.eInvoiceMode}</p>
              </div>
              <div className='flex flex-col gap-1'>
                <Label text='Ký hiệu' />
                <p className='text-sm'>{eInvoiceConfig?.eInvoiceSymbol}</p>
              </div>
            </div>
          ) : (
            <NoData className='!h-fit' />
          )}
        </div>
      </div>
    </div>
  );
}
