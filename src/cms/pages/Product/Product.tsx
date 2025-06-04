import { useEffect, useMemo, useState } from 'react';
import { useTableConfig } from 'src/hooks/useTable';
import useProductStore, { FilterProduct } from 'src/store/useProductStore';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import { Product } from 'src/types/product.type';
import DataTable from 'src/cms/components/Table/DataTable';
import { EditOutlined } from '@ant-design/icons';
import SearchInput from 'src/cms/components/Search/SearchInput';
import BaseButton from 'src/shared/components/Buttons/Button';
import { useNavigate } from 'react-router-dom';
import useCategoryProductStore from 'src/store/useCategoryProductStore';
import { FaRegTrashAlt } from 'react-icons/fa';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { ProductStatus } from 'src/shared/common/enum';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { TableColumnsType } from 'antd/lib';
import ManageProductCategory from './components/ManageProductCategory';
import formatPrice from 'src/shared/utils/common';
import { Empty, Image, Spin } from 'antd';
import ModalConfirm from 'src/cms/components/Modal/ModalConfirm';
import { IoCloseOutline, IoEyeOffOutline, IoEyeOutline, IoRefreshOutline } from 'react-icons/io5';
import { imageCardDefault } from 'src/assets/images';
import FilterDropdown from 'src/cms/components/Filter/FilterDropdown';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import ProductCard from './components/ProductCard';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import useInfiniteScroll from 'src/hooks/useInfiniteScroll';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { POT_DISABLED, POT_ENABLED } from 'src/shared/common/icon';
import NoData from 'src/cms/components/NoData/NoData';
import { generateImageURL } from 'src/shared/utils/utils';
import { useTheme } from 'src/provider/ThemeContext';
import useAuthStore from 'src/store/authStore';
import { IoMdSync } from 'react-icons/io';

const ProductList = () => {
  const { theme } = useTheme();
  const { getQuery } = useUrlQuery();
  const [open, setOpen] = useState<boolean>(false);
  const {
    products,
    isLoading,
    fetchProducts,
    total,
    deleteProducts,
    updateStatusProduct,
    updateProductVisibility,
    syncProductPos
  } = useProductStore();
  const { currentUser } = useAuthStore();

  const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);
  const [openModalChangeActive, setOpenModalChangeActive] = useState<boolean>(false);
  const [rowSelectVisible, setRowSelectVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const { fetchCategoryProduct, categoryProduct, isLoading: loadingCategory } = useCategoryProductStore();
  useEffect(() => {
    fetchCategoryProduct();
  }, []);
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [filters, setFilters] = useState<FilterProduct>({
    search: getQuery('search') || undefined,
    productCategoryId: getQuery('productCategoryId') || undefined
  });
  const posIntegration = useMemo(() => {
    return currentUser?.currentUserStore?.store?.company?.posIntegration;
  }, [currentUser]);

  const { tableProps, resetToFirstPage } = useTableConfig<Product, FilterProduct>({
    data: products,
    totalItems: total,
    isLoading,
    fetchData: fetchProducts,
    filters
  });

  const { data, loading, containerRef, sentinelRef, updateItems, removeItems } = useInfiniteScroll<Product>(
    fetchProducts,
    filters
  );
  const columns: TableColumnsType<Product> = [
    {
      title: 'Sản phẩm',
      render: (value: Product) => (
        <div className='flex items-center overflow-hidden gap-4'>
          <Image
            src={
              generateImageURL(value?.thumbnail, currentUser?.currentUserStore?.store?.company?.posConnectionUrl) ||
              imageCardDefault
            }
            alt='avatar'
            style={{
              borderRadius: '10%',
              width: '35px',
              height: '35px',
              objectFit: 'cover'
            }}
          />
          <h2 className='w-[200px] line-clamp-2'>{value?.name}</h2>
        </div>
      )
    },
    { title: 'Danh mục', dataIndex: ['productCategory', 'name'] },
    { title: 'Đơn vị', dataIndex: 'unit' },
    {
      title: 'Giá bán (VNĐ)',
      render: (value: Product) => {
        return <div>{formatPrice(value.price)} VNĐ</div>;
      }
    },
    { title: 'Nội dung', render: (value: Product) => <h2 className='w-[180px] line-clamp-2'>{value.description}</h2> },
    {
      title: 'Trạng thái',
      render: (value: Product) => (
        <>
          {value?.status === ProductStatus.IN_STOCK ? (
            <div className='flex w-[100px] justify-center items-center gap-2 flex-row px-2 py-[2px] rounded-[20px] bg-mintGreen'>
              <div className='w-[8px] h-[8px] rounded-[50%] bg-successGreen text-darkGreen'></div>
              <p>Còn món</p>
            </div>
          ) : (
            <div className='flex w-[100px] justify-center items-center gap-2 flex-row px-2 py-[2px] rounded-[20px] bg-lightMint'>
              <div className='w-[8px] h-[8px] rounded-[50%] bg-lightGray'></div>
              <p>Hết món</p>
            </div>
          )}
        </>
      )
    },
    {
      fixed: 'right',
      title: 'Tác vụ',
      render: (value: Product) => (
        <div className='flex items-center gap-4'>
          <BaseButton
            className='h-[28px] w-auto min-w-[32px] md:w-[90px] rounded-md overflow-hidden'
            variant={value?.isActive === true ? 'solid' : 'dashed'}
            onClick={() => handleChangeProductVisibility(value)}
          >
            <p className='hidden md:block'>{value?.isActive === true ? 'Tắt món' : 'Bật món'}</p>
            <div className='block md:hidden'>
              {value?.isActive === true ? <IoEyeOffOutline size={14} /> : <IoEyeOutline size={14} />}
            </div>
          </BaseButton>

          <BaseButton
            className='h-[28px] w-auto min-w-[32px] md:w-[90px] rounded-md overflow-hidden'
            variant={value?.status === ProductStatus.IN_STOCK ? 'solid' : 'dashed'}
            onClick={() => handleChangeProductStatus(value)}
          >
            <p className='hidden md:block'>
              {value?.status === ProductStatus.OUT_OF_STOCK ? 'Đặt lại món' : 'Hết món'}
            </p>
            <div className='block md:hidden'>
              {value?.status === ProductStatus.OUT_OF_STOCK ? (
                <IoRefreshOutline size={14} />
              ) : (
                <IoCloseOutline size={14} />
              )}
            </div>
          </BaseButton>
          {!posIntegration && (
            <BaseButton
              className='h-[28px] w-auto min-w-[32px] md:w-[50px] rounded-md overflow-hidden'
              variant='filled'
              onClick={() => navigate(`${value?.id}`)}
            >
              <EditOutlined className='text-primary text-[14px] font-bold' />
            </BaseButton>
          )}
        </div>
      )
    }
  ];

  const handleChangeProductStatus = async (value: Product) => {
    try {
      const res = await updateStatusProduct(value.id, {
        status: value.status === ProductStatus.IN_STOCK ? ProductStatus.OUT_OF_STOCK : ProductStatus.IN_STOCK
      });
      if ((res as any)?.status) {
        updateItems(value.id, {
          status: value.status === ProductStatus.IN_STOCK ? ProductStatus.OUT_OF_STOCK : ProductStatus.IN_STOCK
        });
      }
      await fetchProducts(filters);
      setOpenModalDelete(false);
      setSelectedRowKeys([]);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  const handleChangeProductVisibility = async (value: Product) => {
    try {
      const res = await updateProductVisibility({
        ids: [value.id],
        isActive: value.isActive === true ? false : true
      });
      if ((res as any)?.status) {
        updateItems(value.id, { isActive: !value.isActive });
      }
      await fetchProducts(filters);
      setOpenModalDelete(false);
      setSelectedRowKeys([]);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<FilterProduct>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetToFirstPage();
  };

  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleDeleteSuccess = () => {
    handleFiltersChange({ productCategoryId: undefined });
  };

  const categoryOptions = useMemo(() => {
    return categoryProduct.map((category) => ({
      label: category.name,
      value: category.id
    }));
  }, [categoryProduct]);

  const handleDeleteProducts = async () => {
    try {
      await deleteProducts(selectedRowKeys);
      await fetchProducts(filters);
      removeItems(selectedRowKeys as []); // Add this line to remove items from the local state
      setOpenModalDelete(false);
      setSelectedRowKeys([]);
    } catch (error) {
      setOpenModalDelete(false);
    }
  };

  const handleChangeStatusActiveProducts = async () => {
    try {
      const res = await updateProductVisibility({ ids: selectedRowKeys, isActive: visible });
      if ((res as any)?.status) {
        updateItems(selectedRowKeys as [], { isActive: visible });
      }
      setOpenModalChangeActive(false);
      setSelectedRowKeys([]);
      await fetchProducts(filters);
    } catch (error) {
      setOpenModalChangeActive(false);
    }
  };

  useEffect(() => {
    if (!selectedRowKeys.length) {
      setRowSelectVisible(false);
    }
  }, [selectedRowKeys]);
  const handleSyncProduct = async () => {
    await syncProductPos();
  };
  return (
    <MainHeader
      title={
        <div className='flex flex-row gap-4 items-center mr-3'>
          <h2 className='text-[16px] sm:text-xl xl:text-2xl sm:w-auto '>Quản lý món</h2>
          <div className='lg:hidden'>
            <FilterDropdown
              filtersFields={[
                {
                  key: 'search',
                  label: 'Tìm kiếm',
                  type: 'search',
                  placeholder: 'Tìm kiếm sản phẩm'
                },
                {
                  key: 'productCategoryId',
                  label: 'Danh mục',
                  type: 'select',
                  options: categoryOptions,
                  placeholder: 'Danh mục'
                }
              ]}
              filters={filters}
              setFilters={setFilters}
              className='w-full'
            />
          </div>
        </div>
      }
    >
      <div className='relative flex flex-wrap items-center justify-between gap-4 mb-6'>
        <>
          <div className='flex items-center gap-2 flex-1'>
            {!!data?.length && !posIntegration && (
              <div className='lg:hidden flex items-center' onClick={() => setRowSelectVisible(true)}>
                <RiCheckboxMultipleLine size={20} className='text-primary' />
                <p className='text-sm ml-1 text-primary font-medium'>Chọn</p>
              </div>
            )}
            {!isMobile && (
              <div className='hidden lg:flex gap-4 items-center flex-1'>
                <SearchInput
                  defaultValue={filters.search}
                  onSearch={(value) => handleFiltersChange({ search: value })}
                  placeholder='Tìm kiếm sản phẩm...'
                  className='max-w-96 flex-1'
                />
                <FilterDropdown
                  filtersFields={[
                    {
                      key: 'productCategoryId',
                      label: 'Danh mục',
                      type: 'select',
                      options: categoryOptions,
                      placeholder: 'Danh mục'
                    }
                  ]}
                  filters={filters}
                  setFilters={(newFilters) => {
                    setFilters((prev) => ({ ...prev, ...newFilters }));
                    resetToFirstPage();
                  }}
                  className='w-full'
                />
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {!posIntegration && (
              <>
                <BaseButton className='text-xs' onClick={() => navigate('import')} override={theme.darkGreen}>
                  Import
                </BaseButton>
                <BaseButton className='text-xs' onClick={() => navigate('create')}>
                  Thêm món
                </BaseButton>
              </>
            )}

            <BaseButton
              className=' sm:w-fit w-[40px]'
              loading={isLoading}
              onClick={handleSyncProduct}
              icon={<IoMdSync className='text-2xl' />}
            >
              <span className='sm:inline hidden'>Đồng bộ</span>
            </BaseButton>
            <BaseButton className='text-xs' onClick={() => setOpen(true)}>
              Danh mục
            </BaseButton>
          </div>
        </>
        {(rowSelectVisible || !!selectedRowKeys.length) && (
          <>
            <SelectedStatusBar
              selectedCount={selectedRowKeys.length}
              label='danh mục'
              onCancel={() => {
                setSelectedRowKeys([]);
                setRowSelectVisible(false);
              }}
              onDelete={() => setOpenModalDelete(true)}
              onSelectAll={(value) => setSelectedRowKeys(value ? data.map((product) => product.id) : [])}
              isAllSelected={selectedRowKeys.length === data.length}
            >
              {!!selectedRowKeys.length && (
                <>
                  <BaseButton
                    shape='round'
                    icon={<POT_DISABLED fill='#ffffff' />}
                    className='bg-orange-400 hover:!bg-orange-300'
                    onClick={() => {
                      setVisible(false);
                      setOpenModalChangeActive(true);
                    }}
                  >
                    Tắt món
                  </BaseButton>
                  <BaseButton
                    shape='round'
                    icon={<POT_ENABLED fill='#ffffff' />}
                    color='primary'
                    onClick={() => {
                      setVisible(true);
                      setOpenModalChangeActive(true);
                    }}
                  >
                    Bật món
                  </BaseButton>
                </>
              )}
            </SelectedStatusBar>
            {!!selectedRowKeys.length && (
              <div className='w-full lg:hidden flex items-center gap-4 bg-white shadow-lg rounded-md p-1'>
                <BaseButton
                  icon={<POT_DISABLED />}
                  className='flex-1 bg-white !text-danger hover:!bg-white'
                  onClick={() => {
                    setVisible(false);
                    setOpenModalChangeActive(true);
                  }}
                >
                  Tắt món
                </BaseButton>
                <div className=' w-[2px] bg-gray-300 top-0 bottom-0 h-[24px]' />
                <BaseButton
                  icon={<POT_ENABLED />}
                  className='flex-1 bg-white !text-darkGreen  '
                  onClick={() => {
                    setVisible(true);
                    setOpenModalChangeActive(true);
                  }}
                >
                  Bật món
                </BaseButton>
              </div>
            )}
          </>
        )}
      </div>
      {!data?.length && !loading && <NoData description='Không có sản phẩm nào' className='lg:hidden' />}
      <div className='lg:hidden flex flex-col flex-1 overflow-y-scroll max-h-[calc(100svh-140px)]' ref={containerRef}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {data?.map((product) => {
            return (
              <ProductCard
                onPressCard={(id) => {
                  if (posIntegration) return;
                  navigate(id);
                }}
                product={product}
                selection={rowSelectVisible || selectedRowKeys.length > 0}
                selectedRowKeys={selectedRowKeys}
                handleProductVisibility={handleChangeProductVisibility}
                handleProductStatus={handleChangeProductStatus}
                handleRowSelection={(id) => {
                  setSelectedRowKeys((prevSelected) =>
                    prevSelected.includes(id) ? prevSelected.filter((key) => key !== id) : [...prevSelected, id]
                  );
                }}
              />
            );
          })}
        </div>
        <Spin spinning={loading} className='flex justify-center items-center' />
        <div ref={sentinelRef} />
      </div>

      <DataTable<Product>
        rowKey='id'
        columns={columns}
        className='hidden lg:block'
        {...tableProps}
        rowSelectionEnabled
        rowSelectionType='checkbox'
        selectedRowKeys={selectedRowKeys}
        onSelectedRowsChange={(newSelectedRowKeys) => {
          handleRowSelectionChange(newSelectedRowKeys);
          setRowSelectVisible(true);
        }}
        rowSelectionEnabled={!posIntegration}
        emptyText='Không có sản phẩm nào'
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: <NoData description='Không có sản phẩm nào' /> }}
      />
      <ManageProductCategory
        showFunction={posIntegration}
        open={open}
        onCloseDrawer={() => setOpen(false)}
        handleDeleteSuccess={handleDeleteSuccess}
      />
      <ModalDelete isOpen={openModalDelete} onClose={() => setOpenModalDelete(false)} onConfirm={handleDeleteProducts}>
        <h2>Bạn muốn xoá sản phẩm này?</h2>
      </ModalDelete>
      <ModalConfirm
        isOpen={openModalChangeActive}
        onClose={() => setOpenModalChangeActive(false)}
        onConfirm={handleChangeStatusActiveProducts}
        loading={isLoading}
      >
        <h2>
          Bạn muốn <span className='font-semibold'>{visible === true ? 'Bật' : 'Tắt'}</span> các món sau
        </h2>
      </ModalConfirm>
    </MainHeader>
  );
};

export default ProductList;
