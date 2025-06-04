import { Table, Button } from 'antd';
import { Control, FieldErrors, UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { EmployeePayload, EmployeePayloadWithOutPassword } from 'src/validate/employeeSchema';
import FormSelect from 'src/shared/components/Form/FormSelect';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import { DeleteOutlined } from '@ant-design/icons';
import BaseButton from 'src/shared/components/Buttons/Button';
import { RoleType } from 'src/shared/common/enum';
import useMediaQuery from 'src/hooks/useMediaQuery';
import useStoreStore from 'src/store/useStoreStore';
import NoData from 'src/cms/components/NoData/NoData';
import useEmployeeStore from 'src/store/useEmployeeStore';
import useAuthStore from 'src/store/authStore';

interface DataType {
  key?: number;
  storeId: string;
  role: string;
}

interface DelegationOption {
  value: string;
  label: string;
}

interface EmployeeFormProps {
  control: Control<EmployeePayload | EmployeePayloadWithOutPassword>;
  errors: FieldErrors<EmployeePayload | EmployeePayloadWithOutPassword>;
  listRole: DelegationOption[];
  listStore?: DelegationOption[];
  loading: boolean;
  setValue: UseFormSetValue<EmployeePayload | EmployeePayloadWithOutPassword>;
  clearErrors: UseFormClearErrors<EmployeePayload | EmployeePayloadWithOutPassword>;
  userStores: DataType[];
  id: string | null | undefined;
}

export default function EmployeeForm({
  control,
  errors,
  loading,
  id,
  listRole,
  listStore,
  setValue,
  clearErrors,
  userStores
}: EmployeeFormProps) {
  const { listPosUser } = useEmployeeStore();
  const handleAddRow = () => {
    const newRow = {
      key: Date.now(),
      storeId: '',
      role: ''
    };
    const updatedPermissions = [...(userStores || []), newRow];
    setValue?.('userStores', updatedPermissions);
  };
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { currentUser } = useAuthStore();

  const handleSelectPermission = (index: number, name: keyof DataType, value: string) => {
    let updatedPermissions = [...userStores];

    if (!updatedPermissions.length) {
      updatedPermissions = [{} as DataType]; // Đảm bảo có ít nhất một object hợp lệ
    }

    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [name]: value
    };

    setValue('userStores', updatedPermissions);
    clearErrors(`userStores.${index}.${name}`);
  };

  const handleDeleteUserRole = (index: number) => {
    const updatedPermissions = [...userStores];
    updatedPermissions.splice(index, 1);
    setValue?.('userStores', updatedPermissions);
  };

  const columns = [
    {
      title: 'Tên cửa hàng',
      width: isMobile ? '50%' : '60%',
      dataIndex: 'store',
      key: 'store',
      render: (_: any, record: DataType, index: number) => (
        <FormSelect
          name={`userStores.${index}.storeId`}
          value={record.storeId || undefined}
          options={listStore}
          fieldNames={{
            label: 'label',
            value: 'value'
          }}
          disabled={loading}
          placeholder='Chọn cửa hàng'
          size={isMobile ? 'middle' : 'large'}
          control={control}
          errors={errors?.userStores?.[index]?.storeId}
          onChange={(value) => handleSelectPermission(index, 'storeId', value)}
          className='ant-select-max-width'
        />
      )
    },
    {
      title: 'Vai trò',
      width: isMobile ? '40%' : '30%',
      dataIndex: 'role',
      key: 'role',
      render: (_: any, record: DataType, index: number) => {
        return (
          <FormSelect
            name={`userStores.${index}.role`}
            value={
              record.role === RoleType.MANAGER
                ? 'Quản lý'
                : record.role === RoleType.STORE_OWNER
                  ? 'Chủ cửa hàng'
                  : record.role || undefined
            }
            options={listRole}
            fieldNames={{
              label: 'label',
              value: 'value'
            }}
            disabled={loading}
            placeholder='Chọn vai trò'
            size={isMobile ? 'middle' : 'large'}
            control={control}
            errors={errors?.userStores?.[index]?.role}
            onChange={(value) => handleSelectPermission(index, 'role', value)}
            className='ant-select-max-width'
          />
        );
      }
    },
    {
      title: '',
      dataIndex: 'delete',
      width: '10%',
      key: 'delete',
      render: (_: any, record: DataType, index: number) =>
        index !== 0 ? (
          <DeleteOutlined
            className='cursor-pointer text-xl hover:opacity-65 mb-6'
            style={{ color: '#ff4d4f' }}
            onClick={() => handleDeleteUserRole(index)}
          />
        ) : null
    }
  ];

  return (
    <div>
      <div className='flex flex-col mt-4 md:flex-row gap-x-10'>
        <Field>
          <Label text='Tên nhân viên' validate={true} />
          <FormInput
            control={control}
            name='name'
            type='text'
            disabled={loading}
            placeholder='Tên nhân viên'
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      <div className='flex flex-col mt-4 md:flex-row gap-x-10 gap-y-4'>
        <Field>
          <Label text='Tài khoản' validate={true} />
          <FormInput
            control={control}
            name='username'
            type='text'
            disabled={id ? true : loading}
            placeholder='Tài khoản'
            errors={errors}
            size='large'
          />
        </Field>
        <Field>
          <Label text='Số điện thoại' validate={true} />
          <FormInput
            control={control}
            name='phone'
            type='number'
            placeholder='Số điện thoại'
            disabled={loading}
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      <div className='flex flex-col mt-4 md:flex-row gap-x-10 gap-y-4'>
        <Field>
          <Label text='Mật khẩu' validate={true} />
          <FormInput
            control={control}
            name='password'
            type='password'
            disabled={!!id || loading}
            placeholder='••••••••••'
            errors={errors}
            size='large'
            hidePasswordToggle={!!id}
          />
        </Field>

        <Field>
          <Label text='Địa chỉ' />
          <FormInput
            control={control}
            name='address'
            type='text'
            disabled={loading}
            placeholder='Địa chỉ'
            errors={errors}
            size='large'
          />
        </Field>
      </div>
      {currentUser?.currentUserStore?.store?.company?.posIntegration && (
        <div className='flex flex-col mt-4 md:flex-row gap-x-10 gap-y-4'>
          <Field>
            <Label text='Kết nối nhân viên MobiFone 1POS' validate={true} />
            <FormSelect
              disabled={loading}
              placeholder='Kết nối nhân viên MobiFone 1POS'
              control={control}
              name='posUserId'
              options={listPosUser.map((user) => ({
                label: user?.user_name,
                value: user?.user_id
              }))}
              onChange={(value) => {
                setValue('posUserId', value);
                if (value) {
                  clearErrors('posUserId');
                }
              }}
              errors={errors}
              notFoundContent={<NoData />}
              size='large'
            />
          </Field>
          <Field>{''}</Field>
        </div>
      )}
      <div className='flex flex-row justify-between mt-10'>
        <Label text='Danh sách cửa hàng phân công' validate={true} />
        <BaseButton
          onClick={handleAddRow}
          style={{ marginBottom: 16 }}
          disabled={userStores?.some((item) => !item.storeId || !item.role)}
        >
          Thêm
        </BaseButton>
      </div>
      {userStores?.length > 0 && (
        <Table
          scroll={{ x: 'max-content', y: 400 }}
          dataSource={userStores}
          columns={columns}
          pagination={false}
          size='small'
        />
      )}
    </div>
  );
}
