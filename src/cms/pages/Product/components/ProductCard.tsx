import { Image } from 'antd';
import React from 'react';
import { GoDotFill } from 'react-icons/go';
import { imageCardDefault } from 'src/assets/images';
import { ProductStatus } from 'src/shared/common/enum';
import BaseButton from 'src/shared/components/Buttons/Button';
import BaseCheckbox from 'src/shared/components/Core/Checkbox';
import formatPrice from 'src/shared/utils/common';
import { generateImageURL } from 'src/shared/utils/utils';
import { Product } from 'src/types/product.type';

interface ProductCardProps {
  product: Product;
  selection: boolean;
  selectedRowKeys: React.Key[];
  handleProductVisibility: (product: Product) => void;
  handleProductStatus: (product: Product) => void;
  handleRowSelection: (id: string) => void;
  onPressCard: (id: string) => void;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  selection,
  selectedRowKeys,
  handleProductVisibility,
  handleProductStatus,
  handleRowSelection,
  onPressCard
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }
    onPressCard(product.id);
  };

  return (
    <div
      className='flex items-center rounded-md p-2 gap-2 bg-white'
      style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
      onClick={handleClick}
    >
      {selection && (
        <BaseCheckbox
          className='medium-checkbox'
          checked={selectedRowKeys.includes(product.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleRowSelection(product.id);
          }}
        />
      )}
      <div className='flex-1'>
        <div className='flex justify-between items-center mb-2'>
          <div className='flex gap-[12px]'>
            <Image
              src={generateImageURL(product?.thumbnail) || imageCardDefault}
              alt='avatar'
              style={{
                borderRadius: '10%',
                width: '63px',
                height: '63px',
                objectFit: 'cover'
              }}
            />
            <div className='flex flex-col max-w-[200px]'>
              <h2 className='flex-1 line-clamp-1 font-medium leading-6'>{product.name}</h2>
              <span className='text-xs text-gray-500 '>{product.unit}</span>
              <span className='text-sm font-bold text-primary'>{formatPrice(product.price)} VNĐ</span>
            </div>
          </div>
          <span
            className={`flex  items-center ${product?.status === ProductStatus.OUT_OF_STOCK ? 'text-gray-500' : 'text-successGreen'}`}
          >
            <GoDotFill />{' '}
            <p className='w-[60px]'>{product?.status === ProductStatus.OUT_OF_STOCK ? 'Hết món' : 'Còn món'}</p>
          </span>
        </div>
        <div className='flex gap-2'>
          <div
            className={`${product?.isActive ? 'bg-danger' : 'bg-gray-300'}  h-[28px] w-[80px] md:w-[90px] flex items-center justify-center rounded-md overflow-hidden`}
            onClick={(e) => {
              e.stopPropagation();
              handleProductVisibility(product);
            }}
          >
            <p className='text-white'>{product?.isActive ? 'Tắt món' : 'Bật món'}</p>
          </div>
          <div
            className={`${product?.status === ProductStatus.IN_STOCK ? 'bg-primary' : 'bg-gray-300'} h-[28px] flex-1 rounded-md overflow-hidden  flex items-center justify-center`}
            onClick={(e) => {
              e.stopPropagation();
              handleProductStatus(product);
            }}
          >
            <p className='text-white'>{product?.status === ProductStatus.IN_STOCK ? 'Hết món' : 'Đặt lại món'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
