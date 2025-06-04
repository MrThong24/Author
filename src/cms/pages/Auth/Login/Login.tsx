import BaseButton from 'src/shared/components/Buttons/Button';
import { loginSchema } from 'src/validate/authSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import FormInput from 'src/shared/components/Form/FormInput';
import { Navigate } from 'react-router-dom';
import { getAccessTokenFromLS } from 'src/shared/utils/auth';
import useAuthStore from 'src/store/authStore';
import { LoginPayLoad } from 'src/types/auth.type';
import Label from 'src/shared/components/Core/Label';
import { useEffect, useState } from 'react';
import { UserStore } from 'src/types/user.type';
import { roleTypes } from 'src/shared/common/constant';
import { Option } from 'src/types/utils.type';
import BaseSelect from 'src/shared/components/Core/Select';
import { Empty, notification } from 'antd';
import { logoBlue, mobifone } from 'src/assets/images';
import Field from 'src/shared/components/Core/Field';
import { useTheme } from 'src/provider/ThemeContext';
import { RoleType } from 'src/shared/common/enum';
import { jwtDecode } from 'jwt-decode';
import useWindowResize from 'src/hooks/useWindowResize';

export default function Login() {
  const { theme, setTheme } = useTheme();
  const { isLoading, login, chooseStore } = useAuthStore();
  const [userStoreOptions, setUserStoreOptions] = useState<Array<Option>>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const hasResized = useWindowResize();

  const defaultValue = {
    username: '',
    password: ''
  };
  useEffect(() => {
    setTheme({ ...theme, primary: '#005FAB' });
  }, []);
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm({
    defaultValues: { ...defaultValue },
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  });
  const getUserStores = (userStores: Array<UserStore>) => {
    return userStores.map((currentUserStore) => ({
      value: currentUserStore.storeId,
      label: `${roleTypes.find((roleType) => roleType.value === currentUserStore.role)?.label || ''} ${currentUserStore.store.name}`
    }));
  };
  const onSubmit = async (data: LoginPayLoad) => {
    try {
      if (!isLoggedIn) {
        const response = await login(data);
        const userStoreOptions = getUserStores(response?.userStores || []) || [];
        if (userStoreOptions?.length === 1) {
          await chooseStore({
            token: response?.verifyToken || '',
            storeId: userStoreOptions[0].value || ''
          });
          notification.success({
            message: 'Đăng nhập thành công',
            description: 'Chào mừng bạn đến với order tại bàn!'
          });
        }
        setUserStoreOptions(userStoreOptions);
        setSelectedStore(userStoreOptions[0].value);
        setToken(response?.verifyToken || '');
        setIsLoggedIn(true);
      } else {
        await chooseStore({
          token,
          storeId: selectedStore || ''
        });
        notification.success({
          message: 'Đăng nhập thành công',
          description: 'Chào mừng bạn đến với order tại bàn!'
        });
      }
    } catch (error) {
      console.error(error);
    }
  };
  return !getAccessTokenFromLS() ? (
    <div
      className='flex items-center min-h-screen p-4 bg-gray-100 md:justify-center'
      style={{
        backgroundImage: 'url(/imageLogin.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgb(28 28 28 / 38%)',
          zIndex: 0
        }}
      ></div>
      <div className='flex flex-col overflow-hidden bg-white rounded-md shadow-lg max w-full md:w-[60%] xl:w-1/4 max-h-[450px] z-10'>
        <div className='bg-white w-full px-6 py-10 z-10'>
          <div className='h-full w-full flex items-center relative'>
            <div className='w-full bg-white rounded-lg'>
              <div className='flex justify-center'>
                <img src={logoBlue} alt='Logo' className='h-[60px]' />
              </div>
              <div className='space-y-2 mt-8'>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {!isLoggedIn ? (
                    <div className='space-y-4'>
                      <Field>
                        <Label text='Tài khoản' className='text-sm' />
                        <FormInput
                          control={control}
                          errors={errors}
                          name='username'
                          placeholder='Nhập tài khoản'
                          size='large'
                          disabled={isLoading}
                        />
                      </Field>
                      <Field>
                        <Label text='Mật khẩu' className='text-sm' />
                        <FormInput
                          control={control}
                          errors={errors}
                          type='password'
                          name='password'
                          placeholder='••••••••'
                          size='large'
                          disabled={isLoading}
                        />
                      </Field>
                    </div>
                  ) : (
                    <Field>
                      <Label text='Chọn cửa hàng' className='text-sm' />
                      <BaseSelect
                        value={selectedStore}
                        options={userStoreOptions}
                        placeholder='Chọn loại danh mục'
                        fieldNames={{
                          label: 'label',
                          value: 'value'
                        }}
                        optionFilterProp='label'
                        showSearch
                        onChange={(value) => {
                          setSelectedStore(value);
                        }}
                        dropdownStyle={hasResized ? { maxHeight: '50svh', overflowY: 'auto'} : {}}
                        notFoundContent={
                        <Empty description="Không có dữ liệu" imageStyle={{ height: '60px', objectFit: 'contain' }} className='w-full h-full flex-col items-center justify-center m-auto'
                        />}
                        className='w-full mb-6'
                      />
                    </Field>
                  )}
                  <div className='text-center pt-6'>
                    <BaseButton htmlType='submit' size='large' className='w-full' loading={isLoading}>
                      Đăng nhập
                    </BaseButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Navigate
      replace={true}
      to={
        getAccessTokenFromLS()
          ? (jwtDecode(getAccessTokenFromLS()) as { userStore?: { role?: RoleType } })?.userStore?.role ===
            RoleType.CHEF
            ? '/kitchen/inprogress'
            : '/'
          : '/'
      }
    />
  );
}
