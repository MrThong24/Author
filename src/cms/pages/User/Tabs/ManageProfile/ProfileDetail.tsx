import { Image, Skeleton, Tooltip } from 'antd';
import { imageStoreDefault } from 'src/assets/images';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import { generateImageURL } from 'src/shared/utils/utils';
import useAuthStore from 'src/store/authStore';

export default function ProfileDetail() {
  const { currentUser, isLoading } = useAuthStore();

  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center gap-4 w-full max-w-xl'>
        <div className='w-[160px] h-[160px]'>
          {isLoading ? (
            <Skeleton.Image active />
          ) : (
            <Image
              className=''
              src={generateImageURL(currentUser?.avatar) || imageStoreDefault}
              alt='avatar'
              style={{
                width: '160px',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          )}
        </div>

        <Field className='w-full'>
          <Label text='Tên nhân viên' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {currentUser?.name}
            </div>
          )}
        </Field>

        <Field className='w-full'>
          <Label text='Số điện thoại' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='h-100 px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {currentUser?.phone}
            </div>
          )}
        </Field>

        <Field className='w-full'>
          <Label text='Địa chỉ' />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <Tooltip title={currentUser?.address}>
              <div className='h-13 px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm overflow-hidden text-ellipsis whitespace-nowrap'>
                {currentUser?.address}
              </div>
            </Tooltip>
          )}
        </Field>
      </div>
    </div>
  );
}
