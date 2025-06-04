import { useEffect, useState } from 'react';
import useProductStore from 'src/store/useProductStore';
import BaseSelect from 'src/shared/components/Core/Select';
import { Product } from 'src/types/product.type';
import { formatCurrency, generateImageURL } from 'src/shared/utils/utils';
import { ProductStatus } from 'src/shared/common/enum';

interface SelectProductProps {
  className?: string;
  existingProductIds: Array<string>;
  onSelect: (product: Product) => void;
}

const SelectProduct = ({ onSelect, className, existingProductIds = [], ...props }: SelectProductProps) => {
  const { products, setProducts, isLoading, fetchProducts } = useProductStore();
  const [value, setValue] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts({});
  }, []);

  const handleDisableProducts = () => {
    const _products = [...products];
    _products.forEach((product) => {
      if (existingProductIds.includes(product.id)) {
        (product as any)['disabled'] = true;
      } else {
        (product as any)['disabled'] = false;
      }
    });
    setProducts(_products);
  };

  useEffect(() => {
    if (products?.length) {
      handleDisableProducts();
    }
  }, [existingProductIds, isLoading]);

  return (
    <BaseSelect
      value={value}
      options={products}
      placeholder='Chọn sản phẩm...'
      onSelect={(_value, option) => {
        setValue(null);
        setOpen(false);
        onSelect(option);
      }}
      onDropdownVisibleChange={(visible) => {
        handleDisableProducts();
        setOpen(visible);
      }}
      open={open}
      fieldNames={{
        label: 'name',
        value: 'id'
      }}
      optionFilterProp='name'
      showSearch
      allowClear
      className={`w-full ${className}`}
      {...props}
      optionRender={(option) => (
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-x-2 py-0.5'>
            <img src={generateImageURL(option.data.thumbnail)} alt='product-thumbnail' className='w-7' />
            {option.data.name}
            {option.data.status === ProductStatus.OUT_OF_STOCK && (
              <span className='text-xs text-danger'>(Hết món)</span>
            )}
          </div>
          <span>{formatCurrency(option.data.price)}</span>
        </div>
      )}
    />
  );
};

export default SelectProduct;
