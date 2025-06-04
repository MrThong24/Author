import React, { useEffect, useState } from 'react';
import { Button, Checkbox, CheckboxProps, Drawer, Row } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { FaChevronLeft } from 'react-icons/fa6';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import FormInput from 'src/shared/components/Form/FormInput';
import useZoneStore from 'src/store/useZoneStore';
import BaseInput from 'src/shared/components/Core/Input';
import { useUrlQuery } from 'src/hooks/useUrlQuery';
import ModalDelete from 'src/cms/components/Modal/ModalDelete';
import { ZonePayload, zoneSchema } from 'src/validate/zoneSchema';
import BaseButton from 'src/shared/components/Buttons/Button';
import useMediaQuery from 'src/hooks/useMediaQuery';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import SelectedStatusBar from 'src/cms/components/SelectedStatusBar';
import { IoClose } from 'react-icons/io5';

interface ManageZoneProps {
  open: boolean;
  onCloseDrawer: () => void;
  handleDeleteSuccess: () => void;
}
const ManageZone: React.FC<ManageZoneProps> = ({ open, onCloseDrawer, handleDeleteSuccess }) => {
  const { getQuery } = useUrlQuery();
  const { isLoading, zones, fetchZones, createZone, deleteZones, updateZone } = useZoneStore();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [idEditTable, setIdEditTable] = useState<string>('');
  const [valueEdit, setValueEdit] = useState<string>('');
  const [errorEdit, setErrorEdit] = useState<boolean>(false);
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
  } = useForm<ZonePayload>({
    resolver: yupResolver(zoneSchema)
  });
  const name = watch('name');
  const onSubmit = async (data: ZonePayload) => {
    try {
      await createZone({ ...data, name: data.name });
    } catch (error) {
      console.error(error);
    } finally {
      setIndeterminate(false);
      setCheckAll(false);
      setIdEditTable('');
      setCheckedList([]);
      clearData();
    }
  };

  const clearData = () => {
    setAddingCategory(false);
    reset({
      name: ''
    });
    setAddError(false);
    setRowSelectVisible(false);
  };

  const handleEdit = async (id: string) => {
    const trimmedValue = valueEdit.trim();

    if (!trimmedValue.length) {
      setErrorEdit(true);
      return;
    }

    try {
      await updateZone(id, { name: trimmedValue });
    } catch (error) {
      console.error(error);
    } finally {
      setRowSelectVisible(false);
      setIndeterminate(false);
      setCheckAll(false);
      setIdEditTable('');
      setCheckedList([]);
    }
  };

  const handleDelete = async () => {
    const id = getQuery('productCategoryId');
    const idCheck = checkedList?.some((item) => item === id);
    setOpenModal(false);
    try {
      await deleteZones(checkedList);
      if (idCheck) {
        handleDeleteSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRowSelectVisible(false);
      setIndeterminate(false);
      setCheckAll(false);
      setIdEditTable('');
      setCheckedList([]);
    }
  };

  const onChange = (list: string[]) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < zones.length); // Set indeterminate state
    setCheckAll(list.length === zones.length); // Check 'All' if all options are selected
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    const checked = e.target.checked;
    setCheckedList(checked ? zones.map((item) => item.id) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const onMobileCheckAll = (checked: boolean) => {
    setCheckedList(checked ? zones.map((item) => item.id) : []);
    setIndeterminate(false);
    setCheckAll(checked);
  };

  const handleSwitchToEdit = (id: string) => {
    setIdEditTable(id);
  };

  useEffect(() => {
    fetchZones();
  }, []);

  return (
    <Drawer
      title={<p>Khu vực</p>}
      placement='right'
      open={open}
      width='600'
      loading={isLoading}
      onClose={() => {
        onCloseDrawer();
        setCheckAll(false);
        setIndeterminate(false);
        setCheckedList([]);
        setIdEditTable('');
        clearData();
      }}
      className='relative !bg-paleSkyBlue lg:!bg-white'
      closeIcon={<FaChevronLeft className='text-[20px]' />} // Custom close icon
    >
      <div className='relative flex flex-row gap-4 lg:items-start items-center justify-between'>
        <div className='hidden lg:block flex-1'>
          <FormInput
            disabled={isLoading}
            control={control}
            name='name'
            placeholder='Nhập tên khu vực'
            errors={errors}
            size='large'
            className='w-full'
          />
        </div>
        <div className='lg:hidden flex items-center' onClick={() => setRowSelectVisible(true)}>
          <RiCheckboxMultipleLine size={20} className='text-primary' />
          <p className='text-sm ml-1 text-primary font-medium'>Chọn</p>
        </div>
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
          Thêm
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
            isAllSelected={checkedList.length === zones.length}
          />
        )}
      </div>
      {zones?.length > 0 && (
        <div ref={listRef} className='max-h-[calc(100vh-200px)] overflow-y-auto mt-4 mb-4 scrollbar-custom pr-2'>
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
          {(addingCategory || !!name?.trim()?.length) && isMobile && (
            <div className='block lg:'>
              <div
                className={`${addError ? 'border-red-500' : 'border-white'} flex items-center justify-between gap-4 py-2 border-[1px] mb-2 rounded-lg bg-white`}
                style={{ boxShadow: '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' }}
              >
                <div className='flex items-center flex-1'>
                  <button className='text-gray-500 text-[20px] font-bold px-2' onClick={clearData}>
                    <IoClose />
                  </button>
                  <FormInput
                    disabled={isLoading}
                    control={control}
                    name='name'
                    placeholder='Nhập tên khu vực'
                    errors={errors}
                    size='large'
                    className='w-full'
                  />
                </div>

                <BaseButton
                  className='w-[56px] h-[34px] bg-primary text-white rounded-md mr-2'
                  onClick={handleSubmit(onSubmit)}
                >
                  Lưu
                </BaseButton>
              </div>
              {addError && <p className='text-red-500 text-[12px] ml-1  mt-1'>Tên khu vực không được bỏ trống</p>}
            </div>
          )}
          <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={checkedList}>
            <Row className='flex flex-col gap-2 lg:gap-0'>
              {zones?.map((item) => (
                <div
                  className='flex items-start justify-between gap-4 py-2 lg:border-b bg-white rounded-lg lg:rounded-none px-2 lg:px-0'
                  key={item?.id}
                  style={{ boxShadow: isMobile ? '0px 0px 15px 0px rgba(0, 0, 0, 0.05)' : 'none' }}
                >
                  <div className='flex-1'>
                    <div className='flex flex-1 gap-4'>
                      {(rowSelectVisible || !isMobile) && (
                        <Checkbox value={item.id} className={isMobile ? 'medium-checkbox' : ''} />
                      )}
                      <div className='flex-1'>
                        <BaseInput
                          onChange={(e) => setValueEdit(e.target.value)}
                          value={idEditTable !== item.id ? item?.name : valueEdit}
                          className={`text-[14px] p-2 ${idEditTable !== item.id ? 'border-none' : ''} ${idEditTable !== item.id ? 'pointer-events-none' : ''}`}
                        />
                      </div>
                    </div>
                    {errorEdit && idEditTable === item.id && (
                      <p className='text-red-500 text-[12px] ml-1  mt-1'>Tên khu vực không được bỏ trống</p>
                    )}
                  </div>

                  <BaseButton
                    className={`${idEditTable === item.id ? 'w-[68px]' : 'w-[48px]'} h-[39px] rounded-md overflow-hidden`}
                    variant={idEditTable === item.id ? 'solid' : 'filled'}
                    onClick={() => {
                      if (idEditTable === item.id) {
                        handleEdit(item?.id);
                      } else {
                        setErrorEdit(false);
                        setValueEdit(item?.name);
                        handleSwitchToEdit(item?.id); // Chuyển sang mục chỉnh sửa
                      }
                    }}
                  >
                    {idEditTable === item.id ? 'Lưu' : <EditOutlined className='text-primary text-[20px] font-bold' />}
                  </BaseButton>
                </div>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
      )}
      <ModalDelete isOpen={openModal} onClose={() => setOpenModal(false)} onConfirm={handleDelete} loading={isLoading}>
        <h2>Bạn muốn xoá những khu vực này?</h2>
      </ModalDelete>
    </Drawer>
  );
};

export default ManageZone;
