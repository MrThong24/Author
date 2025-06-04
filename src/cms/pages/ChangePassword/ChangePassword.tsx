import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { IoChevronBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import MainHeader from 'src/cms/components/Headers/MainHeader';
import { RoleType } from 'src/shared/common/enum';
import BaseButton from 'src/shared/components/Buttons/Button';
import Field from 'src/shared/components/Core/Field';
import Label from 'src/shared/components/Core/Label';
import FormInput from 'src/shared/components/Form/FormInput';
import useAuthStore from 'src/store/authStore';
import { ChangePasswordPayload, changePasswordSchema } from 'src/validate/changePasswordSchema';

export default function ChangePassword() {
  const { isLoading, changePassword } = useAuthStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ChangePasswordPayload>({
    resolver: yupResolver(changePasswordSchema)
  });

  const onSubmit = async (data: ChangePasswordPayload) => {
    try {
      const { currentPassword, newPassword } = data;
      await changePassword({ currentPassword, newPassword });
    } catch (error) {}
  };

  return (
    <MainHeader
      title={
        currentUser?.currentUserStore?.role === RoleType.CHEF ? (
          <button className='flex items-center gap-2 mb-6' onClick={() => navigate(-1)}>
            <IoChevronBack size={26} />
            <h2 className='text-black font-semibold text-[16px] sm:text-xl xl:text-2xl'>Đổi mật khẩu</h2>
          </button>
        ) : (
          <h2 className='text-black font-semibold text-[16px] sm:text-xl xl:text-2xl'>Đổi mật khẩu</h2>
        )
      }
    >
      <div className='flex justify-center'>
        <div className='max-w-[600px]'>
          <div className='grid grid-cols-1 grid-rows-3 gap-4'>
            <div className='col-span-2'>
              <Field>
                <Label text='Mật khẩu hiện tại' validate={true} />
                <FormInput
                  control={control}
                  name='currentPassword'
                  type='password'
                  disabled={false}
                  placeholder='••••••••••'
                  errors={errors}
                  size='large'
                />
              </Field>
            </div>
            <div className='col-span-2'>
              <Field>
                <Label text='Mật khẩu mới' validate={true} />
                <FormInput
                  control={control}
                  name='newPassword'
                  type='password'
                  disabled={false}
                  placeholder='••••••••••'
                  errors={errors}
                  size='large'
                />
              </Field>
            </div>
            <div className='col-span-2'>
              <Field>
                <Label text='Nhập lại mật khẩu' validate={true} />
                <FormInput
                  control={control}
                  name='confirmNewPassword'
                  type='password'
                  disabled={false}
                  placeholder='••••••••••'
                  errors={errors}
                  size='large'
                />
              </Field>
            </div>
          </div>
          <h2 className='text-center mt-4 text-[12px]'>
            Mật khẩu của bạn phải có ít nhất 8 kí tự, bao gồm một số, một chữ in hoa, một chữ thường và kí tự đặc biệt
            bao gồm !, @, #, $, %, ^, &, ., _, *
          </h2>
          <div className='flex justify-center mt-20'>
            <BaseButton loading={isLoading} onClick={() => handleSubmit(onSubmit)()} className='w-[120px]'>
              Lưu
            </BaseButton>
          </div>
        </div>
      </div>
    </MainHeader>
  );
}
