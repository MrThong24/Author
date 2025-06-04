import { Image, Skeleton } from 'antd';
import { imageCardDefault } from 'src/assets/images';
import Label from 'src/shared/components/Core/Label';
import formatPrice from 'src/shared/utils/common';
import { generateImageURL } from 'src/shared/utils/utils';
import useProductStore from 'src/store/useProductStore';

export default function ProductDetail() {
  const { detailProduct, isLoading } = useProductStore();

  return (
    <div>
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='flex justify-center'>
          <div className='w-[160px] h-[160px]'>
            {isLoading ? (
              <Skeleton.Image active />
            ) : (
              <Image
                src={generateImageURL(detailProduct?.thumbnail) || imageCardDefault}
                alt='avatar'
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            )}
          </div>
        </div>
        <div className='flex flex-col md:flex-row flex-1 gap-4'>
          <div className='flex-1'>
            <Label text='Tên sản phẩm' className='mb-2' validate={true} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: 200 }} />
            ) : (
              <h2
                className='bg-white px-2 py-2 rounded-lg'
                style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
              >
                {detailProduct?.name}
              </h2>
            )}
          </div>
          <div className='flex-1'>
            <Label text='Tên tiếng anh' className='mb-2' validate={true} />
            {isLoading ? (
              <Skeleton.Input active style={{ width: 200 }} />
            ) : (
              <h2
                className='bg-white  px-2 py-2 rounded-lg h-[36px]'
                style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
              >
                {detailProduct?.translations[0]?.name}
              </h2>
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <div className='flex flex-col flex-1 gap-y-2 mt-4 lg:mt-6'>
          <Label text='Danh mục' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: 200 }} />
          ) : (
            <h2
              className='bg-white  px-2 py-2 rounded-lg'
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              {detailProduct?.productCategory?.name}
            </h2>
          )}
        </div>
        <div className='flex flex-col flex-1 gap-y-2 mt-4 lg:mt-6'>
          <Label text='Đơn vị' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: 200 }} />
          ) : (
            <h2
              className='bg-white   px-2 py-2 rounded-lg'
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              {detailProduct?.unit}
            </h2>
          )}
        </div>
        <div className='flex flex-col flex-1 gap-y-2 mt-4 lg:mt-6'>
          <Label text='Giá' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: 200 }} />
          ) : (
            <h2
              className='bg-white  px-2 py-2 rounded-lg'
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              {formatPrice(detailProduct?.price ?? 0)} VNĐ
            </h2>
          )}
        </div>
      </div>
      <div className='flex flex-col md:flex-row gap-x-10'>
        <div className='flex flex-col flex-1 gap-y-2 mt-4 lg:mt-6'>
          <Label text='Phân loại sản phẩm' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: 200 }} />
          ) : (
            <h2
              className='bg-white  px-2 py-2 rounded-lg'
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              {detailProduct?.productType?.name}
            </h2>
          )}
        </div>
        <div className='flex flex-col flex-1 gap-y-2 mt-4 lg:mt-6'>
          <Label text='Giảm trừ hoá đơn bán hàng' validate={true} />
          {isLoading ? (
            <Skeleton.Input active style={{ width: 200 }} />
          ) : (
            <h2
              className='bg-gray-100 px-2 py-2 rounded-lg'
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              {detailProduct?.productType?.discountPercent || 0}%
            </h2>
          )}
        </div>
        <div className='flex flex-col flex-1'></div>
      </div>
      <div className='mt-4 lg:mt-8'>
        <Label text='Mô tả' validate={false} />
        {isLoading ? (
          <Skeleton.Input active style={{ width: 300 }} />
        ) : detailProduct?.description ? (
          <h2 className='bg-white  px-2 py-2 rounded-lg' style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}>
            {detailProduct?.description}
          </h2>
        ) : (
          ''
        )}
      </div>
      <div className='mt-4 lg:mt-8'>
        <Label text='Mô tả tiếng anh' validate={false} />
        {isLoading ? (
          <Skeleton.Input active style={{ width: 300 }} />
        ) : detailProduct?.translations[0]?.description ? (
          <h2 className='bg-white  px-2 py-2 rounded-lg' style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}>
            {detailProduct?.translations[0]?.description}
          </h2>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
