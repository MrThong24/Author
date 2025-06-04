import { Image, Skeleton } from 'antd';
import { imageStoreDefault } from 'src/assets/images';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import { generateImageURL } from 'src/shared/utils/utils';
import useCompanyStore from 'src/store/useCompanyStore';

export default function CompanyDetail() {
  const { isLoading, detailCompany } = useCompanyStore();
  return (
    <div className='flex justify-center'>
      <div className='flex flex-col items-center gap-8 w-full max-w-xl'>
        <div className='w-[100px] h-[100px]'>
          {isLoading ? (
            <Skeleton.Image active />
          ) : (
            <Image
              src={generateImageURL(detailCompany?.thumbnail) || imageStoreDefault}
              alt='avatar'
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'cover'
              }}
            />
          )}
        </div>

        <Field className='w-full'>
          <Label text='Tên công ty' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: '100%' }} />
          ) : (
            <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
              {detailCompany?.name}
            </div>
          )}
        </Field>

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
            <Label text='Mã số thuế' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                {detailCompany?.taxCode}
              </div>
            )}
          </Field>
        </div>

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
            <Label text='Địa chỉ' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                {detailCompany?.address}
              </div>
            )}
          </Field>
        </div>

        <div className='flex flex-col md:flex-row md:gap-4 w-full'>
          <Field className='mt-2 w-full'>
            <Label text='Đại diện pháp luật' validate={false} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: '100%' }} />
            ) : (
              <div className='w-full h-[44px] px-3 py-3 text-sm border-gray-200 rounded-md bg-white flex items-center shadow-sm'>
                {detailCompany?.legalRepresentative}
              </div>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}
