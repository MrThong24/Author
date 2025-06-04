import React, { useState } from 'react';
import { Checkbox, CheckboxProps, Drawer, Empty, Row } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { FaChevronLeft } from 'react-icons/fa6';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { CategoryPayload, categoryProductSchema } from 'src/validate/categoryProductSchema';
import FormInput from 'src/shared/components/Form/FormInput';
import useCategoryProductStore from 'src/store/useCategoryProductStore';
import BaseInput from 'src/shared/components/Core/Input';
import useProductStore from 'src/store/useProductStore';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import BaseButton from 'src/shared/components/Buttons/Button';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { IoClose } from 'react-icons/io5';
import { LanguageCode } from 'src/shared/common/enum';

interface ManageProductCategoryProps {
  open: boolean;
  onCloseDrawer: () => void;
  handleDeleteSuccess: () => void;
  showFunction?: boolean;
}

const ManageProductCategory: React.FC<ManageProductCategoryProps> = ({
  open,
  onCloseDrawer,
  handleDeleteSuccess,
  showFunction
}) => {
  const { getQuery } = useUrlQuery();
  const { isLoading, categoryProduct, createCategoryProduct, deleteCategoryProduct, updateCategoryProduct } =
    useCategoryProductStore();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [valueEdit, setValueEdit] = useState<string>('');
  const [valueEditEn, setValueEditEn] = useState<string>('');
  const [errorEdit, setErrorEdit] = useState<boolean>(false);
  const [errorName, setErrorName] = useState<boolean>(false);
  const [errorNameEn, setErrorNameEn] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [rowSelectVisible, setRowSelectVisible] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addError, setAddError] = useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CategoryPayload>({
    resolver: yupResolver(categoryProductSchema)
  });

  const name = watch('name');
  const onSubmit = async (data: CategoryPayload) => {
    const formData = {
      name: data.name?.trim(),
      translations: [
        {
          languageCode: LanguageCode.ENGLISH,
          name: data.translations?.trim()
        }
      ]
    };
    try {
      await createCategoryProduct(formData as any);
      clearData();
      await useProductStore.getState().fetchProducts({
        search: getQuery('search') || undefined,
        productCategoryId: getQuery('productCategoryId') || undefined
      });
      setEditCategoryId('');
    } catch (error) {
      // Optional: handle error
    }
  };
  const clearData = () => {
    setAddingCategory(false);
    reset({
      name: '',
      translations: ''
    });
    setAddError(false);
    setRowSelectVisible(false);
  };

  const handleEdit = async (id: string) => {
    let hasError = false;
    setErrorName(false);
    setErrorNameEn(false);
    if (!valueEdit?.trim()) {
      setErrorName(true);
      hasError = true;
    }
    if (!valueEditEn?.trim()) {
      setErrorNameEn(true);
      hasError = true;
    }
    if (hasError) {
      setErrorEdit(true);
      return;
    }
    try {
      await updateCategoryProduct(id, {
        name: valueEdit?.trim(),
        translations: [{ languageCode: LanguageCode.ENGLISH, name: valueEditEn?.trim() }]
      } as any);
      await useProductStore.getState().fetchProducts({
        search: getQuery('search') || undefined,
        productCategoryId: getQuery('productCategoryId') || undefined
      });
    } catch (error) {
    } finally {
      setRowSelectVisible(false);
      setIndeterminate(false);
      setCheckAll(false);
      setEditCategoryId('');
      setCheckedList([]);
      setValueEdit('');
      setValueEditEn('');
      setErrorEdit(false);
      setErrorName(false);
      setErrorNameEn(false);
    }
  };

  const handleDelete = async () => {
    const id = getQuery('productCategoryId');
    const idCheck = checkedList?.some((item) => item === id);
    setOpenModal(false);
    try {
      await deleteCategoryProduct(checkedList);
      await useProductStore.getState().fetchProducts({
        search: getQuery('search') || undefined,
        productCategoryId: idCheck ? undefined : getQuery('productCategoryId') || undefined
      });
      if (idCheck) {
        handleDeleteSuccess();
      }
      setRowSelectVisible(false);
      setIndeterminate(false);
      setCheckedList([]);
      setCheckAll(false);
      setEditCategoryId('');
    } catch (error) {}
  };

  const onChange = (list: string[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < categoryProduct.length);
    setCheckAll(list.length === categoryProduct.length);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    const checked = e.target.checked;
    setCheckedList(checked ? categoryProduct.map((item) => item.id) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const onMobileCheckAll = (checked: boolean) => {
    setCheckedList(checked ? categoryProduct.map((item) => item.id) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleSwitchToEdit = (id: string) => {
    setEditCategoryId(id);
    setErrorEdit(false);
    setErrorName(false);
    setErrorNameEn(false);
  };
  return (
    <Drawer
      title={<p>Danh mục</p>}
      placement='right'
      open={open}
      width='600'
      loading={isLoading}
      onClose={() => {
        onCloseDrawer();
        setCheckAll(false);
        setIndeterminate(false);
        setCheckedList([]);
        clearData();
        setEditCategoryId('');
      }}
      className='relative !bg-paleSkyBlue lg:!bg-white'
      closeIcon={<FaChevronLeft className='text-[20px]' />}
    >
      {!isMobile && (
        <div className='flex items-center mt-4 mb-2'>
          <h2 className='flex-[0.8] font-semibold'>Tên danh mục</h2>
          <h2 className='flex-1 font-semibold'>Tiếng anh</h2>
        </div>
      )}
      {!showFunction && (
        <div
          className={`${!!categoryProduct?.length ? 'justify-between' : 'justify-end'} relative flex flex-row gap-4 lg:items-start items-center mb-2`}
        >
          <div className='hidden lg:flex justify-center items-start gap-4 flex-1'>
            <FormInput
              disabled={isLoading}
              control={control}
              name='name'
              placeholder='Nhập tên danh mục'
              errors={errors}
              size='large'
              className='w-full'
            />
            <FormInput
              disabled={isLoading}
              control={control}
              name='translations'
              placeholder='Nhập tên tiếng anh'
              errors={errors}
              size='large'
              className='w-full'
            />
          </div>
          {!!categoryProduct?.length && (
            <div className='lg:hidden flex items-center' onClick={() => setRowSelectVisible(true)}>
              <RiCheckboxMultipleLine size={20} className='text-primary' />
              <p className='text-sm ml-1 text-primary font-medium'>Chọn</p>
            </div>
          )}
          <BaseButton
            className='py-[19px]'
            onClick={() => {
              if (isMobile) {
                setAddingCategory(true);
                listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                return;
              }
              handleSubmit(onSubmit)();
            }}
          >
            {isMobile ? 'Thêm danh mục' : 'Thêm'}
          </BaseButton>
          {rowSelectVisible && isMobile && (
            <SelectedStatusBar
              selectedCount={checkedList.length}
              onCancel={() => {
                setCheckedList([]);
                setRowSelectVisible(false);
              }}
              onDelete={() => setOpenModal(true)}
              onSelectAll={(value) => onMobileCheckAll(value)}
              isAllSelected={checkedList.length === categoryProduct.length}
            />
          )}
        </div>
      )}
      <div ref={listRef} className='max-h-[calc(100vh-200px)] overflow-y-auto mb-4 scrollbar-custom pr-2'>
        {!!categoryProduct?.length && !showFunction && (
          <div className='hidden lg:flex items-center justify-between mb-2 min-h-[32px]'>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll} className='gap-2'>
              Chọn tất cả
            </Checkbox>
            {checkedList?.length > 0 && (
              <BaseButton color='danger' onClick={() => setOpenModal(true)}>
                Xóa
              </BaseButton>
            )}
          </div>
        )}
        {(addingCategory || !!name?.trim()?.length) && isMobile && (
          <div className='block lg:hidden'>
            <div
              className={`${addError ? 'border-red-500' : 'border-white'} flex flex-col items-end gap-4 p-2 border-[1px] mb-2 rounded-lg bg-white`}
              style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
            >
              <div className='flex items-center flex-1 w-full'>
                <div className='flex flex-col flex-1 justify-center items-center gap-4'>
                  <FormInput
                    disabled={isLoading}
                    control={control}
                    name='name'
                    placeholder='Nhập tên danh mục'
                    errors={errors}
                    size='large'
                    className='w-full'
                  />
                  <FormInput
                    disabled={isLoading}
                    control={control}
                    name='translations'
                    placeholder='Nhập tên tiếng anh'
                    errors={errors}
                    size='large'
                    className='w-full'
                  />
                </div>
              </div>
              <div className='flex gap-4 items-center'>
                <div onClick={clearData}>Huỷ</div>
                <BaseButton
                  className='w-[56px] h-[34px] bg-primary text-white rounded-md mr-2'
                  onClick={handleSubmit(onSubmit)}
                >
                  Lưu
                </BaseButton>
              </div>
            </div>
            {addError && <p className='text-red-500 text-[12px] ml-1 mt-1'>Thông tin không được để trống</p>}
          </div>
        )}

        {categoryProduct?.length > 0 ? (
          <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={checkedList}>
            <Row className='flex flex-col gap-2 lg:gap-0'>
              {categoryProduct?.map((item) => {
                return (
                  <div
                    className='flex items-start justify-between gap-4 py-2 lg:border-b bg-white rounded-lg lg:rounded-none px-2 lg:px-0'
                    key={item?.id}
                    style={{ boxShadow: isMobile ? '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' : 'none' }}
                  >
                    <div className='flex-1'>
                      <div className='flex flex-1 gap-4'>
                        {(rowSelectVisible || !isMobile) && !showFunction && (
                          <Checkbox value={item.id} className={isMobile ? 'medium-checkbox' : ''} />
                        )}

                        <div className='flex-1 flex gap-2'>
                          <BaseInput
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setValueEdit(newValue);
                              setErrorName(!newValue.trim());
                              setErrorEdit(!newValue.trim() || !valueEditEn.trim());
                            }}
                            value={editCategoryId !== item.id ? item?.name : valueEdit}
                            className={`text-[14px] p-2 ${editCategoryId !== item.id ? 'border-none pointer-events-none' : ''} ${errorName && editCategoryId === item.id ? 'border-red-500' : ''}`}
                            placeholder='Tên danh mục'
                          />
                          <BaseInput
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setValueEditEn(newValue);
                              setErrorNameEn(!newValue.trim());
                              setErrorEdit(!newValue.trim() || !valueEdit.trim());
                            }}
                            placeholder={editCategoryId === item?.id ? 'Nhập tên tiếng anh' : ''}
                            value={editCategoryId !== item.id ? item?.translations[0]?.name : valueEditEn}
                            className={`text-[14px] p-2 ${editCategoryId !== item.id ? 'border-none pointer-events-none' : ''} ${errorNameEn && editCategoryId === item.id ? 'border-red-500' : ''}`}
                          />
                        </div>
                      </div>
                      {errorEdit && editCategoryId === item.id && (
                        <p className='text-red-500 text-[12px] ml-1 mt-1'>Thông tin không được để trống</p>
                      )}
                    </div>
                    {!showFunction && (
                      <BaseButton
                        className={`${editCategoryId === item.id ? 'w-[68px]' : 'w-[48px]'} h-[39px] ${
                          editCategoryId === item.id ? `bg-primary` : 'bg-secondary'
                        } text-white rounded-md overflow-hidden`}
                        onClick={() => {
                          if (editCategoryId === item.id) {
                            handleEdit(item?.id);
                          } else {
                            setErrorEdit(false);
                            setErrorName(false);
                            setErrorNameEn(false);
                            setValueEdit(item?.name);
                            setValueEditEn(item?.translations[0]?.name);
                            handleSwitchToEdit(item?.id);
                          }
                        }}
                      >
                        {editCategoryId === item.id ? (
                          'Lưu'
                        ) : (
                          <EditOutlined className='text-primary text-[20px] font-bold' />
                        )}
                      </BaseButton>
                    )}
                  </div>
                );
              })}
            </Row>
          </Checkbox.Group>
        ) : (
          <Empty description='Không có danh mục sản phẩm nào' className='mt-[20%]' />
        )}
      </div>
      <ModalDelete isOpen={openModal} onClose={() => setOpenModal(false)} onConfirm={handleDelete}>
        <h2>Bạn muốn xoá Danh mục này?</h2>
      </ModalDelete>
    </Drawer>
  );
};

export default ManageProductCategory;
